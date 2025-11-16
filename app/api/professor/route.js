import { connection } from "@/lib/db";

export async function GET() {
  const [rows] = await connection.query("SELECT * FROM professor");
  return Response.json(rows);
}
