'use client'

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [table, setTable] = useState("");

  // Fetch data from API
  const fetchTable = async (tableName: string) => {
    setTable(tableName);
    try {
      const res = await fetch(`/api/${tableName}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch table:", error);
      setData([]);
    }
  };

  return (
    <div>
      <h1>Database Tables</h1>
      <div style={{ marginBottom: "20px" }}>
        <h1><button onClick={() => fetchTable("department")}>Department</button></h1>
        <h1><button onClick={() => fetchTable("interest")}>Interest</button></h1>
        <h1><button onClick={() => fetchTable("professor")}>Professor</button></h1>
      </div>

      <h2>Table: {table}</h2>
      <pre style={{ background: "#f0f0f0", padding: "10px" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
