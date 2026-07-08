import jwt from 'jsonwebtoken';

const userId = "695957684199cba15a8d4149";
const token = jwt.sign({ id: userId }, "supersecretkey", { expiresIn: "1d" });

async function makeRequest() {
  try {
    const res = await fetch("http://localhost:5000/api/properties/6a4e12a1879918d3f467fa5e/boost/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ planKey: "15days" })
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("HTTP error:", err);
  } finally {
    process.exit(0);
  }
}
makeRequest();
