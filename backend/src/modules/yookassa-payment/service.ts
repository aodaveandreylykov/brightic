import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

type Options = {
  shopId: string
  secretKey: string
  returnUrl: string
}

type YookassaAmount = { value: string; currency: string }

type YookassaPayment = {
  id: string
  status: string
  amount: YookassaAmount
  confirmation?: { type?: string; confirmation_url?: string }
  metadata?: Record<string, string>
}

/**
 * Brightic / this Medusa setup treats cart totals as major RUB units
 * (same as the storefront formatMoney helper). Do not divide by 100.
 */
function toRubMajor(amount: unknown) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return "0.00"
  return value.toFixed(2)
}

class YookassaProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "yookassa"

  static validateOptions(options: Options) {
    if (!options.shopId || !options.secretKey) {
      throw new Error("YooKassa requires YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY")
    }
  }

  protected options: Options

  constructor(container: Record<string, unknown>, options: Options) {
    super(container, options)
    this.options = options
  }

  private authHeader() {
    const token = Buffer.from(`${this.options.shopId}:${this.options.secretKey}`).toString("base64")
    return `Basic ${token}`
  }

  private async yookassa<T>(path: string, init?: RequestInit & { idempotenceKey?: string }): Promise<T> {
    const response = await fetch(`https://api.yookassa.ru/v3${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
        ...(init?.idempotenceKey ? { "Idempotence-Key": init.idempotenceKey } : {}),
        ...init?.headers,
      },
    })
    const body = (await response.json()) as T & { description?: string }
    if (!response.ok) {
      throw new Error(body.description || `YooKassa ${response.status}`)
    }
    return body
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const returnUrl =
      (typeof input.data?.return_url === "string" && input.data.return_url) || this.options.returnUrl
    const sessionId = String(input.data?.session_id || input.context?.idempotency_key || crypto.randomUUID())
    const payment = await this.yookassa<YookassaPayment>("/payments", {
      method: "POST",
      idempotenceKey: sessionId,
      body: JSON.stringify({
        amount: {
          value: toRubMajor(input.amount),
          currency: (input.currency_code || "rub").toUpperCase(),
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
        description: "Заказ Brightic",
        metadata: { session_id: sessionId },
        receipt: input.context?.customer?.email
          ? {
              customer: { email: input.context.customer.email },
              items: [
                {
                  description: "Заказ Brightic",
                  quantity: "1.00",
                  amount: {
                    value: toRubMajor(input.amount),
                    currency: (input.currency_code || "rub").toUpperCase(),
                  },
                  vat_code: 1,
                  payment_mode: "full_payment",
                  payment_subject: "commodity",
                },
              ],
            }
          : undefined,
      }),
    })

    return {
      id: payment.id,
      status: this.mapStatus(payment.status),
      data: {
        payment_id: payment.id,
        confirmation_url: payment.confirmation?.confirmation_url,
        session_id: sessionId,
      },
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return this.initiatePayment(input)
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const payment = await this.retrieveYookassa(input.data)
    return {
      status: this.mapStatus(payment.status),
      data: {
        ...input.data,
        payment_id: payment.id,
        confirmation_url: payment.confirmation?.confirmation_url,
      },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const payment = await this.retrieveYookassa(input.data)
    if (payment.status === "succeeded") {
      return { data: { ...input.data, payment_id: payment.id } }
    }
    const captured = await this.yookassa<YookassaPayment>(`/payments/${payment.id}/capture`, {
      method: "POST",
      idempotenceKey: `capture-${payment.id}`,
      body: JSON.stringify({}),
    })
    return { data: { ...input.data, payment_id: captured.id } }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const paymentId = this.paymentId(input.data)
    await this.yookassa("/refunds", {
      method: "POST",
      idempotenceKey: `refund-${paymentId}-${Date.now()}`,
      body: JSON.stringify({
        payment_id: paymentId,
        amount: {
          value: toRubMajor(input.amount),
          currency: "RUB",
        },
      }),
    })
    return { data: input.data }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const paymentId = this.paymentId(input.data)
    await this.yookassa(`/payments/${paymentId}/cancel`, {
      method: "POST",
      idempotenceKey: `cancel-${paymentId}`,
      body: JSON.stringify({}),
    })
    return { data: input.data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const payment = await this.retrieveYookassa(input.data)
    return { data: { ...input.data, payment_id: payment.id, status: payment.status } }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const payment = await this.retrieveYookassa(input.data)
    return { status: this.mapStatus(payment.status) }
  }

  async getWebhookActionAndData(payload: {
    data: Record<string, unknown>
    rawData: string | Buffer
    headers: Record<string, unknown>
  }): Promise<WebhookActionResult> {
    const body =
      typeof payload.data === "object" && payload.data
        ? payload.data
        : JSON.parse(String(payload.rawData || "{}"))
    const event = String(body.event || "")
    const object = (body.object || {}) as YookassaPayment
    const sessionId = object.metadata?.session_id || ""
    const amount = Number(object.amount?.value || 0)

    if (event === "payment.succeeded") {
      return {
        action: PaymentActions.SUCCESSFUL,
        data: { session_id: sessionId, amount },
      }
    }
    if (event === "payment.canceled") {
      return {
        action: PaymentActions.CANCELED,
        data: { session_id: sessionId, amount },
      }
    }
    return {
      action: PaymentActions.PENDING,
      data: { session_id: sessionId, amount },
    }
  }

  private paymentId(data?: Record<string, unknown>) {
    const id = data?.payment_id || data?.id
    if (!id) throw new Error("YooKassa payment id is missing")
    return String(id)
  }

  private retrieveYookassa(data?: Record<string, unknown>) {
    return this.yookassa<YookassaPayment>(`/payments/${this.paymentId(data)}`)
  }

  private mapStatus(status: string): PaymentSessionStatus {
    if (status === "succeeded") return PaymentSessionStatus.CAPTURED
    if (status === "waiting_for_capture") return PaymentSessionStatus.AUTHORIZED
    if (status === "canceled") return PaymentSessionStatus.CANCELED
    if (status === "pending") return PaymentSessionStatus.PENDING
    return PaymentSessionStatus.PENDING
  }
}

export default YookassaProviderService
