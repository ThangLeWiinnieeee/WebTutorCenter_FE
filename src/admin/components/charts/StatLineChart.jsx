import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Biểu đồ đường dùng chung cho thống kê admin (recharts). Nhận sẵn các hàm định dạng
// để mỗi trang tự quyết cách hiển thị trục/tooltip (tiền tệ, số lượng, ngày, tháng).
const StatLineChart = ({
  data = [],
  xKey,
  yKey,
  color = "#1e3a5f",
  height = 280,
  xTickFormatter,
  yTickFormatter,
  tooltipValueFormatter,
  tooltipLabelFormatter,
  valueName = "",
  dot = false,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
      <defs>
        <linearGradient id={`line-${yKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.9} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
      <XAxis
        dataKey={xKey}
        tickFormatter={xTickFormatter}
        tick={{ fontSize: 11, fill: "#64748b" }}
        tickLine={false}
        axisLine={{ stroke: "#e2e8f0" }}
        minTickGap={20}
        padding={{ left: 6, right: 6 }}
      />
      <YAxis
        tickFormatter={yTickFormatter}
        tick={{ fontSize: 11, fill: "#64748b" }}
        tickLine={false}
        axisLine={false}
        width={52}
        allowDecimals={false}
      />
      <Tooltip
        formatter={(value) => [tooltipValueFormatter ? tooltipValueFormatter(value) : value, valueName]}
        labelFormatter={tooltipLabelFormatter}
        contentStyle={{
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
          fontSize: 12,
        }}
        cursor={{ stroke: color, strokeOpacity: 0.25, strokeWidth: 1 }}
      />
      <Line
        type="monotone"
        dataKey={yKey}
        stroke={`url(#line-${yKey})`}
        strokeWidth={2.5}
        dot={dot}
        activeDot={{ r: 4, strokeWidth: 0 }}
        isAnimationActive={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

export default StatLineChart;
