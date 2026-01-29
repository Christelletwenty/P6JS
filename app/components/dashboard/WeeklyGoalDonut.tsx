import {
  Sector,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieSectorDataItem,
} from "recharts";

type Props = {
  done: number;
  goal: number;
};

function PieSlice(props: PieSectorDataItem) {
  const name = props.payload?.name;

  const fill = name === "Réalisées" ? "#0B23F4" : "#B6BDFC";

  return <Sector {...props} fill={fill} stroke="transparent" />;
}

export default function WeeklyGoalDonut({ done, goal }: Props) {
  const remaining = Math.max(goal - done, 0);

  const data = [
    { name: "Réalisées", value: done },
    { name: "Restantes", value: remaining },
  ];

  return (
    <div className="card">
      <div className="card-big">
        x{done} <span className="muted">sur objectif de {goal}</span>
      </div>
      <div className="card-sub">Courses hebdomadaire réalisées</div>

      <div
        style={{ height: 220, minHeight: 220, width: "100%", marginTop: 12 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(v, name) => [`${v}`, name]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #EEF0F6",
                boxShadow: "0 10px 24px rgba(16, 24, 40, 0.10)",
                padding: "10px 12px",
              }}
              labelStyle={{ color: "#6B7280", fontSize: 12, marginBottom: 4 }}
              itemStyle={{ color: "#111827", fontSize: 13 }}
            />

            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={85}
              startAngle={0}
              endAngle={360}
              paddingAngle={0}
              cornerRadius={16}
              stroke="transparent"
              isAnimationActive={false}
              shape={PieSlice}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="pie-legend">
        <div className="item">
          <span className="dot" style={{ background: "#0B23F4" }} />
          <span>{done} réalisées</span>
        </div>
        <div className="item">
          <span className="dot" style={{ background: "#B6BDFC" }} />
          <span>{remaining} restants</span>
        </div>
      </div>
    </div>
  );
}
