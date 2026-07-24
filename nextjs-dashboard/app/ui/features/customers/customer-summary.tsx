export function CustomerSummary({ pendingLabel, paidLabel, pending, paid, invoiceText }: { pendingLabel: string; paidLabel: string; pending: string; paid: string; invoiceText: string }) {
  return <><dl className="flex w-full items-center justify-between border-b py-5"><div className="flex w-1/2 flex-col"><dt className="text-xs">{pendingLabel}</dt><dd className="font-medium">{pending}</dd></div><div className="flex w-1/2 flex-col"><dt className="text-xs">{paidLabel}</dt><dd className="font-medium">{paid}</dd></div></dl><p className="pt-4 text-sm">{invoiceText}</p></>;
}
