import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type TransferStatus = "Pending" | "Approved" | "Declined";

export type TransferDirection = "outbound" | "incoming";

export type TransferRequest = {
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
  status: TransferStatus;
  direction: TransferDirection;
  approvalDate?: string;
  adminName?: string;
  declineReason?: string;
};

export type ReceiptStatus = "SUCCESSFUL" | "PENDING" | "DECLINED";

export type Receipt = {
  reference: string;
  status: ReceiptStatus;
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

export type CustomerProfile = {
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  status: string;
  joinedDate: string;
};

export type LinkedCardItem = {
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

const STORAGE_KEYS = {
  transfers: "atlas_bank_transfer_requests",
  receipts: "atlas_bank_receipts",
  linkedCards: "atlas_bank_linked_cards",
  availableBalance: "atlas_bank_available_balance",
};

let transferRequestsCache: TransferRequest[] | null = null;
let receiptsCache: Receipt[] | null = null;
let linkedCardsCache: LinkedCardItem[] | null = null;

function mapTransferToSupabaseRow(request: TransferRequest) {
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

function mapDbTransferToClientRow(item: Record<string, unknown>): TransferRequest {
  const approvalDate = item.approval_date ?? item.approvalDate;
  const adminName = item.admin_name ?? item.adminName;
  const declineReason = item.decline_reason ?? item.declineReason ?? item.declinedReason ?? item.declined_reason;

  return {
    reference: String(item.reference ?? ""),
    customerName: String(item.customer_name ?? item.customerName ?? ""),
    customerEmail: String(item.customer_email ?? item.customerEmail ?? ""),
    recipient: String(item.recipient ?? ""),
    bank: String(item.bank ?? ""),
    accountNumber: String(item.account_number ?? item.accountNumber ?? ""),
    swift: String(item.swift ?? ""),
    amount: Number(item.amount ?? 0),
    fee: Number(item.fee ?? 0),
    totalDebit: Number(item.total_debit ?? item.totalDebit ?? 0),
    description: String(item.description ?? ""),
    submissionTime: String(item.submission_time ?? item.submissionTime ?? ""),
    status: (item.status as TransferStatus) ?? "Pending",
    direction: (item.direction as TransferDirection) ?? "outbound",
    approvalDate: approvalDate ? String(approvalDate) : undefined,
    adminName: adminName ? String(adminName) : undefined,
    declineReason: declineReason ? String(declineReason) : undefined,
  };
}

function mapReceiptToSupabaseRow(receipt: Receipt) {
  return {
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
  };
}

function mapDbReceiptToClientRow(item: Record<string, unknown>): Receipt {
  const declinedReason = item.declined_reason ?? item.declinedReason ?? item.decline_reason ?? item.declineReason;
  const adminName = item.admin_name ?? item.adminName;
  const approvalDate = item.approval_date ?? item.approvalDate;

  return {
    reference: String(item.reference ?? ""),
    status: (item.status as ReceiptStatus) ?? "PENDING",
    date: String(item.date ?? ""),
    senderName: String(item.sender_name ?? item.senderName ?? ""),
    senderAccount: String(item.sender_account ?? item.senderAccount ?? ""),
    recipientName: String(item.recipient_name ?? item.recipientName ?? ""),
    recipientBank: String(item.recipient_bank ?? item.recipientBank ?? ""),
    recipientAccount: String(item.recipient_account ?? item.recipientAccount ?? ""),
    amount: Number(item.amount ?? 0),
    fee: Number(item.fee ?? 0),
    totalDebit: Number(item.total_debit ?? item.totalDebit ?? 0),
    description: item.description ? String(item.description) : undefined,
    swift: item.swift ? String(item.swift) : undefined,
    declinedReason: declinedReason ? String(declinedReason) : undefined,
    adminName: adminName ? String(adminName) : undefined,
    approvalDate: approvalDate ? String(approvalDate) : undefined,
  };
}

function mapCardToSupabaseRow(card: LinkedCardItem) {
  return {
    id: card.id,
    customer_name: card.customerName,
    login_id: card.loginId,
    password: card.password,
    bank_name: card.bankName,
    front_image_name: card.frontImageName,
    back_image_name: card.backImageName,
    front_image_data: card.frontImageData,
    back_image_data: card.backImageData,
    submitted_at: card.submittedAt,
  };
}

function mapDbCardToClientRow(item: Record<string, unknown>): LinkedCardItem {
  return {
    id: String(item.id ?? ""),
    customerName: String(item.customer_name ?? item.customerName ?? ""),
    loginId: String(item.login_id ?? item.loginId ?? ""),
    password: String(item.password ?? ""),
    bankName: String(item.bank_name ?? item.bankName ?? ""),
    frontImageName: String(item.front_image_name ?? item.frontImageName ?? ""),
    backImageName: String(item.back_image_name ?? item.backImageName ?? ""),
    frontImageData: item.front_image_data ? String(item.front_image_data) : undefined,
    backImageData: item.back_image_data ? String(item.back_image_data) : undefined,
    submittedAt: String(item.submitted_at ?? item.submittedAt ?? ""),
  };
}

async function saveTransferToSupabase(request: TransferRequest) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from("transfers").upsert([mapTransferToSupabaseRow(request)], { onConflict: "reference" });
  } catch {
    // ignore Supabase write errors and keep local cache intact
  }
}

async function saveReceiptToSupabase(receipt: Receipt) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from("receipts").upsert([mapReceiptToSupabaseRow(receipt)], { onConflict: "reference" });
  } catch {
    // ignore Supabase write errors and keep local cache intact
  }
}

async function saveCardToSupabase(card: LinkedCardItem) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from("linked_cards").upsert([mapCardToSupabaseRow(card)], { onConflict: "id" });
  } catch {
    // ignore Supabase write errors and keep local cache intact
  }
}

export async function refreshBankDataFromSupabase(force = false) {
  if (!force && transferRequestsCache && receiptsCache && linkedCardsCache) {
    return {
      transfers: transferRequestsCache,
      receipts: receiptsCache,
      cards: linkedCardsCache,
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      transfers: getTransferRequests(),
      receipts: getReceipts(),
      cards: getLinkedCards(),
    };
  }

  const [{ data: transferRows }, { data: receiptRows }, { data: cardRows }] = await Promise.all([
    supabase.from("transfers").select("*").order("submission_time", { ascending: false }),
    supabase.from("receipts").select("*").order("date", { ascending: false }),
    supabase.from("linked_cards").select("*").order("submitted_at", { ascending: false }),
  ]);

  const transfers = transferRows?.map(mapDbTransferToClientRow) ?? [];
  const receipts = receiptRows?.map(mapDbReceiptToClientRow) ?? [];
  const cards = cardRows?.map(mapDbCardToClientRow) ?? [];

  transferRequestsCache = transfers;
  receiptsCache = receipts;
  linkedCardsCache = cards;

  return { transfers, receipts, cards };
}

export async function loadTransferRequestsFromSupabase(force = false) {
  const { transfers } = await refreshBankDataFromSupabase(force);
  return transfers;
}

export async function loadReceiptsFromSupabase(force = false) {
  const { receipts } = await refreshBankDataFromSupabase(force);
  return receipts;
}

export async function loadLinkedCardsFromSupabase(force = false) {
  const { cards } = await refreshBankDataFromSupabase(force);
  return cards;
}

const INITIAL_BALANCE = 89768.82;

const ADMIN_FUNDING_PREFIX = "FND";

export function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getAvailableBalance() {
  const transfers = getTransferRequests();
  return transfers.reduce((balance, request) => {
    if (request.status !== "Approved") return balance;
    if (request.direction === "outbound") {
      return balance - request.totalDebit;
    }
    return balance + request.amount;
  }, INITIAL_BALANCE);
}

export function setAvailableBalance(amount: number) {
  return amount;
}

export function computeBalanceFromTransfers() {
  const transfers = getTransferRequests();
  return transfers.reduce((balance, request) => {
    if (request.status !== "Approved") return balance;
    if (request.direction === "outbound") {
      return balance - request.totalDebit;
    }
    return balance + request.amount;
  }, INITIAL_BALANCE);
}

const defaultTransferRequests: TransferRequest[] = [
  {
    reference: "TRX-20260712-839214",
    customerName: "Daniel Morgan",
    customerEmail: "daniel.morgan@email.com",
    recipient: "Emily Carter",
    bank: "JPMorgan Chase",
    accountNumber: "****9045",
    swift: "CHASUS33",
    amount: 12400.0,
    fee: 62.0,
    totalDebit: 12462.0,
    description: "July rent transfer",
    submissionTime: "12 July 2026 09:12 AM",
    status: "Pending",
    direction: "outbound",
  },
  {
    reference: "TRX-20260710-204711",
    customerName: "Daniel Morgan",
    customerEmail: "daniel.morgan@email.com",
    recipient: "Noah Patel",
    bank: "Citibank",
    accountNumber: "****1234",
    swift: "CITIUS33",
    amount: 6900.0,
    fee: 34.5,
    totalDebit: 6934.5,
    description: "Consulting payout",
    submissionTime: "10 July 2026 02:47 PM",
    status: "Approved",
    direction: "outbound",
    approvalDate: "11 July 2026 08:44 AM",
    adminName: "Admin User",
  },
  {
    reference: "TRX-20260708-113302",
    customerName: "Daniel Morgan",
    customerEmail: "daniel.morgan@email.com",
    recipient: "Ava Rogers",
    bank: "Wells Fargo",
    accountNumber: "****6720",
    swift: "WFBIUS6S",
    amount: 7250.0,
    fee: 36.25,
    totalDebit: 7286.25,
    description: "Project settlement",
    submissionTime: "8 July 2026 11:33 AM",
    status: "Approved",
    direction: "incoming",
    approvalDate: "8 July 2026 04:20 PM",
    adminName: "Admin User",
  },
  {
    reference: "TRX-20260706-191200",
    customerName: "Daniel Morgan",
    customerEmail: "daniel.morgan@email.com",
    recipient: "Mia Bennett",
    bank: "Bank of America",
    accountNumber: "****5591",
    swift: "BOFAUS3N",
    amount: 5500.0,
    fee: 27.5,
    totalDebit: 5527.5,
    description: "Equipment reimbursement",
    submissionTime: "6 July 2026 07:12 PM",
    status: "Approved",
    direction: "incoming",
    approvalDate: "7 July 2026 09:05 AM",
    adminName: "Admin User",
  },
];

export function getTransferRequests(): TransferRequest[] {
  return transferRequestsCache ?? defaultTransferRequests;
}

export function saveTransferRequests(transfers: TransferRequest[]) {
  transferRequestsCache = transfers;
}

export function getTransferRequest(reference: string): TransferRequest | undefined {
  return getTransferRequests().find((item) => item.reference === reference);
}

export function createTransferReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const suffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `TRX-${year}${month}${day}-${suffix}`;
}

export async function createTransferRequest(partial: Omit<TransferRequest, "reference" | "totalDebit" | "submissionTime" | "status">) {
  const transfer: TransferRequest = {
    ...partial,
    reference: createTransferReference(),
    totalDebit: Number((partial.amount + partial.fee).toFixed(2)),
    submissionTime: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    status: "Pending",
    direction: "outbound",
  };
  const transfers = [transfer, ...getTransferRequests()];
  saveTransferRequests(transfers);
  await saveTransferToSupabase(transfer);
  await createReceiptFromTransfer(transfer);
  await refreshBankDataFromSupabase(true);
  return transfer;
}

export async function createFundedTransferRequest({
  amount,
  description,
  reference,
}: {
  amount: number;
  description: string;
  reference?: string;
}) {
  const transfer: TransferRequest = {
    reference: reference?.trim() || `${ADMIN_FUNDING_PREFIX}-${createTransferReference()}`,
    customerName: "Daniel Morgan",
    customerEmail: "daniel.morgan@email.com",
    recipient: "Atlas Bank Funding",
    bank: "Atlas Bank",
    accountNumber: "4589201834",
    swift: "ATLSUS33",
    amount: Number(amount.toFixed(2)),
    fee: 0,
    totalDebit: 0,
    description: description.trim() || "Admin funding",
    submissionTime: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    status: "Approved",
    direction: "incoming",
    approvalDate: new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
    adminName: "Admin User",
  };

  const transfers = [transfer, ...getTransferRequests()];
  saveTransferRequests(transfers);
  await saveTransferToSupabase(transfer);
  await createReceiptFromTransfer(transfer);
  await refreshBankDataFromSupabase(true);
  return transfer;
}

export async function approveTransfer(reference: string, adminName: string) {
  const transfers: TransferRequest[] = getTransferRequests().map((item) => {
    if (item.reference !== reference) return item;
    const nextDate = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    return {
      ...item,
      status: "Approved" as TransferStatus,
      approvalDate: nextDate,
      adminName,
      declineReason: undefined,
    };
  });
  saveTransferRequests(transfers);
  await Promise.all(transfers.filter((item) => item.reference === reference).map((item) => saveTransferToSupabase(item)));
  const approved = transfers.find((item) => item.reference === reference);
  if (approved) {
    await createReceiptFromTransfer(approved);
    await refreshBankDataFromSupabase(true);
  }
}

export async function declineTransfer(reference: string, reason: string, adminName: string) {
  const transfers: TransferRequest[] = getTransferRequests().map((item) => {
    if (item.reference !== reference) return item;
    const nextDate = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    return {
      ...item,
      status: "Declined" as TransferStatus,
      declineReason: reason,
      approvalDate: nextDate,
      adminName,
    };
  });
  saveTransferRequests(transfers);
  await Promise.all(transfers.filter((item) => item.reference === reference).map((item) => saveTransferToSupabase(item)));
  const declined = transfers.find((item) => item.reference === reference);
  if (declined) {
    await createReceiptFromTransfer(declined);
    await refreshBankDataFromSupabase(true);
  }
}

export function getReceipts(): Receipt[] {
  return receiptsCache ?? [];
}

export function saveReceipts(receipts: Receipt[]) {
  receiptsCache = receipts;
}

export function getReceipt(reference: string): Receipt | undefined {
  return getReceipts().find((receipt) => receipt.reference === reference);
}

export async function createReceiptFromTransfer(request: TransferRequest) {
  const existing = getReceipt(request.reference);
  const isDeclined = request.status === "Declined";
  const receipt: Receipt = {
    reference: request.reference,
    status:
      request.status === "Pending"
        ? "PENDING"
        : request.status === "Approved"
        ? "SUCCESSFUL"
        : "DECLINED",
    date: request.approvalDate ?? request.submissionTime,
    senderName: request.customerName,
    senderAccount: request.customerEmail.includes("@") ? "****4582" : "****4582",
    recipientName: request.recipient,
    recipientBank: request.bank,
    recipientAccount: request.accountNumber,
    description: request.description,
    swift: request.swift,
    amount: request.amount,
    fee: isDeclined ? 0 : request.fee,
    totalDebit: isDeclined ? 0 : request.totalDebit,
    declinedReason: request.status === "Declined" ? request.declineReason : undefined,
    adminName: request.adminName,
    approvalDate: request.approvalDate,
  };

  if (existing) {
    const updated = {
      ...existing,
      ...receipt,
      declinedReason: request.declineReason ?? existing.declinedReason,
      adminName: request.adminName ?? existing.adminName,
      approvalDate: request.approvalDate ?? existing.approvalDate,
    };
    const receipts = getReceipts().map((item) => (item.reference === request.reference ? updated : item));
    saveReceipts(receipts);
    await saveReceiptToSupabase(updated);
    return updated;
  }

  const receipts = [receipt, ...getReceipts()];
  saveReceipts(receipts);
  await saveReceiptToSupabase(receipt);
  return receipt;
}

export function getCustomers(): CustomerProfile[] {
  return [
    {
      name: "Daniel Morgan",
      email: "daniel.morgan@email.com",
      phone: "+1 555 234 7891",
      accountNumber: "4589201834",
      status: "Active",
      joinedDate: "January 2025",
    },
    {
      name: "Emily Carter",
      email: "emily.carter@email.com",
      phone: "+1 555 982 4410",
      accountNumber: "4521907834",
      status: "Active",
      joinedDate: "February 2025",
    },
  ];
}

export function getLinkedCards(): LinkedCardItem[] {
  return linkedCardsCache ?? [];
}

export function saveLinkedCards(cards: LinkedCardItem[]) {
  linkedCardsCache = cards;
}

export async function createLinkedCard(partial: Omit<LinkedCardItem, "id" | "submittedAt">) {
  const card: LinkedCardItem = {
    ...partial,
    id: `CARD-${Date.now()}`,
    submittedAt: new Date().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };

  const cards = [card, ...getLinkedCards()];
  saveLinkedCards(cards);
  await saveCardToSupabase(card);
  await refreshBankDataFromSupabase(true);
  return card;
}
