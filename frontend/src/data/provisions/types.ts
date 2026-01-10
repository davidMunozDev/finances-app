/**
 * Backend row type - amount comes as string from database
 */
export interface ProvisionBackendRow {
  id: number;
  budget_id: number;
  category_id: number;
  name: string;
  amount: string; // DECIMAL from DB
}

/**
 * Frontend Provision type - amount converted to number
 */
export interface Provision {
  id: number;
  budget_id: number;
  category_id: number;
  name: string;
  amount: number; // Converted from string
}

/**
 * Request body for creating a single provision
 */
export interface CreateProvisionBody {
  category_id: number;
  name: string;
  amount: number;
}

/**
 * Request body for creating multiple provisions at once
 */
export interface CreateProvisionBulkBody {
  items: Array<{
    category_id: number;
    name: string;
    amount: number;
  }>;
}

/**
 * Response from creating a single provision
 */
export interface CreateProvisionResult {
  id: number;
}

/**
 * Response from creating multiple provisions
 */
export interface CreateProvisionBulkResult {
  created: Array<{
    id: number;
  }>;
}
