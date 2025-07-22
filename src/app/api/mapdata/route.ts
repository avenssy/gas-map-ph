import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://avenssy:X7dW7J7A6wDs0VEW@cluster0gas-map-prices.6plswz6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0gas-map-prices";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db("gas-price-app");
    const collection = db.collection("gas-prices");

    const data = await collection.find({}).toArray();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
