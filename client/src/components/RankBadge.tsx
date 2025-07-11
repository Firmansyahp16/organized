export function RankBadge({ rank }: { rank: string }) {
  const lowerRank = String(rank).toLowerCase();
  let bgColor = "bg-gray-500";
  let textColor = "text-white";
  const level = parseInt(
    lowerRank.replace(lowerRank.startsWith("kyu") ? "kyu" : "dan", ""),
    10
  );
  const rankType = lowerRank.startsWith("kyu") ? "kyu" : "dan";
  if (lowerRank.startsWith("kyu")) {
    const level = parseInt(lowerRank.replace("kyu", ""), 10);
    switch (level) {
      case 9:
        bgColor = "bg-white";
        textColor = "text-black";
        break;
      case 8:
        bgColor = "bg-yellow-400";
        break;
      case 7:
        bgColor = "bg-orange-500";
        break;
      case 6:
        bgColor = "bg-green-500";
        break;
      case 5:
        bgColor = "bg-blue-500";
        break;
      case 4:
        bgColor = "bg-purple-600";
        break;
      case 3:
        bgColor = "bg-amber-900";
        break;
      case 2:
        bgColor = "bg-amber-900";
        break;
      case 1:
        bgColor = "bg-amber-900"; // Coklat tua
        break;
      default:
        bgColor = "bg-gray-400";
        break;
    }
  } else if (lowerRank.startsWith("dan")) {
    bgColor = "bg-black";
  }

  return (
    <span className={`badge p-2 font-bold ${bgColor} ${textColor} border-none`}>
      {rankType.charAt(0).toUpperCase() + rankType.slice(1)} {level}
    </span>
  );
}
