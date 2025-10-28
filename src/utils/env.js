export function getEnvValue(key) {
  const candidates = [
    process.env[`REACT_APP_${key}`],
    process.env[`NEXT_PUBLIC_${key}`],
    process.env[key],
  ];

  const selected = candidates.find((value) =>
    typeof value === "string" && value.trim().length > 0
  );

  return (selected ?? "").toString().trim();
}
