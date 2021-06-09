export namespace ICcBill {
  export enum EventType {
    NewSaleSuccess = 'NewSaleSuccess',
    NewSaleFailure = 'NewSaleFailure',
    Cancellation = 'Cancellation',
    Expiration = 'Expiration'
  }

  export enum CurrencyCode {
    AUD = '036',
    CAD = '124',
    JPY = '392',
    GBP = '826',
    USD = '840',
    EUR = '978'
  }

  export interface NonRecurringDynamicFormData {
    initialPrice: string;
    initialPeriod: string;
    currencyCode: CurrencyCode;
    [key: string]: any;
  }

  export interface RecurringDynamicFormData extends NonRecurringDynamicFormData {
    recurringPrice: string;
    recurringPeriod: string;
    numRebills: string;
  }

  export type DynamicFormData =
    | RecurringDynamicFormData
    | NonRecurringDynamicFormData;

  export interface IService {
    generateFormUrl(params: GenerateUrlParams, metadataObj: Metadata): Promise<string>
    handleEvent(eventType: EventType, event: WebhookInDto): Promise<unknown>
  }

  export interface WebhookInQuery {
    clientAccnum: string;
    clientSubacc: string;
    eventType: EventType;
    eventGroupType: 'Subscription';
  }

  export interface WebhookEvent {
    clientAccnum: string;
    clientSubacc: string;
    timestamp: string;

    [key: string]: string;
  }

  interface CustomFields {
    'X-metadata': string;
  }

  export interface GenerateUrlParams {
    price: string;
    period: string;
  }

  export interface Metadata {
    userId: string;
    targetUserId?: string;
    isDeposit?:boolean
  }

  export interface NewSaleSuccessEvent extends WebhookEvent, CustomFields {
    transactionId: string;
    subscriptionId: string;
    flexId: string;
    dynamicPricingValidationDigest: string;
  }

  export interface NewSaleFailureEvent extends WebhookEvent, CustomFields {
    transactionId: string;
    flexId: string;
    dynamicPricingValidationDigest: string;
    failureReason: string;
    failureCode: string;
  }

  export interface CancellationEvent extends WebhookEvent {
    subscriptionId: string;
    reason: string;
    source: string;
  }

  export interface ExpirationEvent extends CancellationEvent {
  }

  export type WebhookInDto =
    | NewSaleSuccessEvent
    | NewSaleFailureEvent
    | CancellationEvent
    | ExpirationEvent;

  export interface SuccessNotificationPayload {
    result: true;
    targetUserId: string;
  }

  export interface FailureNotificationPayload {
    result: false;
    errorMessage: string;
  }

  export type NotificationPayload =
    | SuccessNotificationPayload
    | FailureNotificationPayload;
}
