export default function ResultTable({ data }) {
  const allergensList = [
    "Gluten", "Egg", "Crustaceans", "Fish", "Peanut", "Soy", "Milk",
    "Tree nuts", "Celery", "Mustard"
  ];
  const nutrList = ["Energy", "Fat", "Carbohydrate", "Sugar", "Protein", "Sodium"];

  return (
    <div>
      <h3>Allergens</h3>
      <table border="1" cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Allergen</th>
            <th>Detected</th>
            <th>Source Snippet</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {allergensList.map((a) => {
            const info = data.allergens?.[a] || { detected: false, snippet: null, confidence: 0 };
            return (
              <tr key={a}>
                <td>{a}</td>
                <td>{info.detected ? "Yes" : "No"}</td>
                <td style={{ maxWidth: 360, wordBreak: "break-word" }}>{info.snippet || "-"}</td>
                <td>{typeof info.confidence === "number" ? info.confidence.toFixed(2) : "0.00"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 style={{ marginTop: 18 }}>Nutritional values</h3>
      <table border="1" cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Source Snippet</th>
          </tr>
        </thead>
        <tbody>
          {nutrList.map((n) => {
            const info = data.nutrition?.[n] || { value: null, unit: null, snippet: null };
            return (
              <tr key={n}>
                <td>{n}</td>
                <td>{info.value ?? "-"}</td>
                <td>{info.unit ?? "-"}</td>
                <td style={{ maxWidth: 360, wordBreak: "break-word" }}>{info.snippet || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
