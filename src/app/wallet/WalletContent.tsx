"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfileAction } from "@/app/update-profile/actions";
import { Wallet, TrendingUp, DollarSign, Clock, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { requestWithdrawalAction } from "./actions";
import Link from "next/link";

const WalletContent = () => {
	const router = useRouter();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [showWithdraw, setShowWithdraw] = useState(false);
	const [method, setMethod] = useState("bank");
	const [account, setAccount] = useState("");
	const [country, setCountry] = useState("");
	const [accountName, setAccountName] = useState("");

	const { data: user, isLoading } = useQuery({
		queryKey: ["userProfile"],
		queryFn: () => getUserProfileAction(),
	});

	useEffect(() => {
		if (!isLoading && user && !(user as any).isCreator) {
			router.push("/");
		}
	}, [user, isLoading]);

	const { mutate: requestWithdrawal, isPending } = useMutation({
		mutationFn: () => requestWithdrawalAction(method, account, country, accountName),
		onSuccess: () => {
			toast({ title: "Solicitud enviada", description: "Tu retiro será procesado en los próximos días." });
			setShowWithdraw(false);
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
		},
		onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
	});

	if (isLoading) return <p className='text-center mt-10 text-muted-foreground text-sm'>Cargando...</p>;

	const balance = ((user as any)?.balance || 0) / 100;

	// Format with thousands separator, no unnecessary decimals
	const formatBalance = (amount: number) => {
		return new Intl.NumberFormat("es-CO", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	const lastWithdrawal = (user as any)?.lastWithdrawal;
	const now = new Date();
	const nextWithdrawal = lastWithdrawal
		? new Date(new Date(lastWithdrawal).getTime() + 15 * 24 * 60 * 60 * 1000)
		: null;
	const canWithdraw = !nextWithdrawal || now >= nextWithdrawal;
	const daysLeft = nextWithdrawal
		? Math.ceil((nextWithdrawal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
		: 0;

	return (
		<div className='px-4 py-6 max-w-lg mx-auto w-full'>
			{/* Balance card */}
			<div className='rounded-2xl p-6 mb-6' style={{ background: 'linear-gradient(135deg, #E0005E, #ff6b9d)' }}>
				<div className='flex items-center gap-2 mb-2'>
					<Wallet className='w-5 h-5 text-white/80' />
					<p className='text-white/80 text-sm font-medium'>Saldo disponible</p>
				</div>
				<p className='text-black text-4xl font-black'>${formatBalance(balance)}</p>
				<p className='text-black/60 text-xs mt-1'>USD</p>
			</div>

			{/* Reload button */}
			<Link href="/wallet/reload">
				<button className='w-full flex items-center justify-center gap-2 bg-[#00AFF0] text-white font-bold py-3 rounded-full hover:bg-[#0099d9] transition-colors mb-6'>
					<ArrowUpFromLine className='w-5 h-5' />
					Recargar Saldo
				</button>
			</Link>

			{/* Stats */}
			<div className='grid grid-cols-2 gap-3 mb-4'>
				<div className='border rounded-xl p-4'>
					<div className='flex items-center gap-2 mb-1'>
						<TrendingUp className='w-4 h-4 text-green-500' />
						<p className='text-xs text-muted-foreground'>Total ganado</p>
					</div>
					<p className='font-bold text-lg'>${formatBalance(balance)}</p>
				</div>
				<div className='border rounded-xl p-4'>
					<div className='flex items-center gap-2 mb-1'>
						<DollarSign className='w-4 h-4 text-primary' />
						<p className='text-xs text-muted-foreground'>Enviado por</p>
					</div>
					<p className='font-bold text-lg'>OnlyHub</p>
				</div>
			</div>

			{/* Withdraw button */}
			{balance > 0 && (
				<div className='mb-6'>
					{canWithdraw ? (
						<button
							onClick={() => setShowWithdraw(!showWithdraw)}
							className='w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-full hover:bg-green-600 transition-colors'
						>
							<ArrowDownToLine className='w-5 h-5' />
							Solicitar retiro
						</button>
					) : (
						<div className='w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground font-semibold py-3 rounded-full text-sm'>
							<Clock className='w-4 h-4' />
							Próximo retiro en {daysLeft} día{daysLeft !== 1 ? "s" : ""}
						</div>
					)}

					{showWithdraw && canWithdraw && (
						<div className='mt-3 border rounded-xl p-4 flex flex-col gap-3'>
							<p className='font-semibold text-sm'>Datos de retiro</p>

							{/* Method */}
							<div>
								<p className='text-xs text-muted-foreground mb-1.5'>Método</p>
								<div className='flex gap-2'>
									{["bank", "paypal"].map((m) => (
										<button
											key={m}
											onClick={() => setMethod(m)}
											className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
												method === m ? "bg-primary text-white border-primary" : "border-border"
											}`}
										>
											{m === "bank" ? "Banco" : "PayPal"}
										</button>
									))}
								</div>
							</div>

							{/* Country */}
							<div>
								<p className='text-xs text-muted-foreground mb-1.5'>País</p>
								<select
									value={country}
									onChange={(e) => setCountry(e.target.value)}
									className='w-full border rounded-lg px-4 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30'
								>
									<option value=''>Selecciona tu país</option>
									<option value='CO'>Colombia</option>
									<option value='MX'>México</option>
									<option value='AR'>Argentina</option>
									<option value='PE'>Perú</option>
									<option value='CL'>Chile</option>
									<option value='VE'>Venezuela</option>
									<option value='EC'>Ecuador</option>
									<option value='BO'>Bolivia</option>
									<option value='PY'>Paraguay</option>
									<option value='UY'>Uruguay</option>
									<option value='US'>Estados Unidos</option>
									<option value='ES'>España</option>
									<option value='OTHER'>Otro</option>
								</select>
							</div>

							{/* Account holder name */}
							<div>
								<p className='text-xs text-muted-foreground mb-1.5'>Nombre del titular</p>
								<input
									value={accountName}
									onChange={(e) => setAccountName(e.target.value)}
									placeholder='Nombre completo del titular'
									className='w-full border rounded-lg px-4 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30'
								/>
							</div>

							{/* Account number / PayPal */}
							<div>
								<p className='text-xs text-muted-foreground mb-1.5'>
									{method === "bank" ? "Número de cuenta" : "Email de PayPal"}
								</p>
								<input
									value={account}
									onChange={(e) => setAccount(e.target.value)}
									placeholder={method === "bank" ? "Ej: 1234567890" : "email@ejemplo.com"}
									className='w-full border rounded-lg px-4 py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/30'
								/>
							</div>

							<div className='flex items-center justify-between text-sm border-t pt-3'>
								<span className='text-muted-foreground'>Monto a retirar</span>
								<span className='font-bold text-green-500'>${formatBalance(balance)}</span>
							</div>

							<button
								onClick={() => account && country && accountName && requestWithdrawal()}
								disabled={isPending || !account || !country || !accountName}
								className='w-full bg-primary text-white font-bold py-3 rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors'
							>
								{isPending ? "Procesando..." : "Confirmar retiro"}
							</button>

							<p className='text-xs text-muted-foreground text-center'>
								Los retiros se procesan en 3-5 días hábiles. Los pagos OnlyHub los hace cada 15 días.
							</p>
						</div>
					)}
				</div>
			)}

			{/* History */}
			<div>
				<p className='font-bold text-sm mb-3'>Historial de pagos</p>
				{balance === 0 ? (
					<div className='flex flex-col items-center py-10 gap-2'>
						<Clock className='w-10 h-10 text-muted-foreground/30' />
						<p className='text-muted-foreground text-sm'>No hay pagos aún</p>
					</div>
				) : (
					<div className='border rounded-xl p-4 flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='w-9 h-9 rounded-full bg-[#00AFF0]/10 flex items-center justify-center'>
								<ArrowUpFromLine className='w-4 h-4 text-[#00AFF0]' />
							</div>
							<div>
								<p className='text-sm font-semibold'>Recarga de saldo</p>
								<p className='text-xs text-muted-foreground'>Recarga realizada</p>
							</div>
						</div>
						<p className='font-bold text-[#00AFF0]'>+${formatBalance(balance)}</p>
					</div>
				)}
			</div>
		</div>
	);
};
export default WalletContent;
