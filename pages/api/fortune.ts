import type { NextApiRequest, NextApiResponse } from "next";
import { config } from "dotenv";
import { dispenseFortune } from "../../lib/fortune";

config(); // Load env variables

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await dispenseFortune();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error dispensing fortune:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
