// Hotel photos (Unsplash). If offline or a photo fails, the gradient layer underneath shows instead.
const P = ["photo-1566073771259-6a8506099945", "photo-1551882547-ff40c63fe5fa", "photo-1520250497591-112f2f40a3f4", "photo-1542314831-068cd1dbfeeb", "photo-1564501049412-61c2a3083791"];
export const hotelImg = (id, w = 1400) => `https://images.unsplash.com/${P[id % P.length]}?auto=format&fit=crop&w=${w}&q=70`;
export const bg = (id, shade = 0.7) => ({
  backgroundImage: `linear-gradient(to top, rgba(2,6,23,${shade}), rgba(2,6,23,.1)), url(${hotelImg(id)}), linear-gradient(135deg,#0d9488,#4f46e5)`,
  backgroundSize: "cover", backgroundPosition: "center",
});
