import { CdpClient } from "@coinbase/cdp-sdk";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

// A few sample fortunes
const FORTUNES = [
  "Fortune favors the based.",
  "You will onboard the next billion.",
  "The mempool holds your destiny.",
  "Your SOL is safe with you.",
  "Build boldly, anon.",
];

function getRandomFortune() {
  const index = Math.floor(Math.random() * FORTUNES.length);
  return FORTUNES[index];
}

export async function dispenseFortune() {
  const cdp = new CdpClient();
  const fortune = getRandomFortune();

  // 1. Create a new wallet
  const account = await cdp.solana.createAccount();
  const fromAddress = new PublicKey(account.address);

  // 2. Fund it using CDP faucet
  await cdp.solana.requestFaucet({
    address: account.address,
    token: "sol",
  });

  // 3. Wait until funds arrive
  let balance = 0;
  let tries = 0;
  while (balance === 0 && tries < 30) {
    balance = await connection.getBalance(fromAddress);
    if (balance === 0) {
      await new Promise((r) => setTimeout(r, 1000));
      tries++;
    }
  }

  // 4. Build a transaction that:
  // - Sends a tiny bit of SOL
  // - Includes the fortune as a memo
  const toAddress = new PublicKey("EeVPcnRE1mhcY85wAh3uPJG1uFiTNya9dCJjNUPABXzo"); // Use any address
  const memoProgramId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromAddress,
      toPubkey: toAddress,
      lamports: 1000, // 0.000001 SOL
    }),
    {
      keys: [],
      programId: memoProgramId,
      data: Buffer.from(fortune),
    }
  );

  tx.recentBlockhash = blockhash;
  tx.feePayer = fromAddress;

  const serialized = Buffer.from(
    tx.serialize({ requireAllSignatures: false })
  ).toString("base64");

  // 5. Sign using CDP
  const { signature } = await cdp.solana.signTransaction({
    address: account.address,
    transaction: serialized,
  });

  const signedTx = Buffer.from(signature, "base64");

  // 6. Send it to the network
  const txSig = await connection.sendRawTransaction(signedTx);

  return {
    explorerUrl: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
    fortune,
  };
}
