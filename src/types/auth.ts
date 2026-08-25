export interface User {
  id: string;
  tenantId: string;
  email: string;
  role?: string;
}

export interface Tenant {
  id: string;
  name: string;
  businessPhone?: string | null;
  businessEmail?: string | null;
  logoUrl?: string | null;
  createdAt: Date | string;
}

export interface AuthenticatedSession {
  id: string;
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  exp?: number;
}

export interface TenantContext {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  tenant: Tenant;
}
