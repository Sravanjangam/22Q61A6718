import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API = process.env.REACT_APP_BASE_API;

const StockPriceAggregator = () => {
  const [stocks, setStocks] = useState({});
  const [selected, setSelected] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${API}/stocks`).then((res) => setStocks(res.data.stocks || {}));
  }, []);

  useEffect(() => {
    if (selected) {
      axios
        .get(`${API}/stocks/${selected}?minutes=30`)
        .then((res) => setData(res.data.prices || []));
    }
  }, [selected]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Stock Chart</h2>
      <select onChange={(e) => setSelected(e.target.value)} value={selected}>
        <option value="">Select stock</option>
        {Object.entries(stocks).map(([name, ticker]) => (
          <option key={ticker} value={ticker}>
            {name} ({ticker})
          </option>
        ))}
      </select>

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(t) => new Date(t).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default StockPriceAggregator;
