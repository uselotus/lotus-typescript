export interface FailedCustomers {
    property1?: any;
    property2?: any;
}

export interface BatchCustomers {
    success: string;
    failed_customers: FailedCustomers;
}

