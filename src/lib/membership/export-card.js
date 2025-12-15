import { toPng } from "html-to-image";

export const exportCardAsPng = async (node, filename = "northside-gta-membership-card.png") => {
  if (!node) throw new Error("Card element is not available");

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "transparent",
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
