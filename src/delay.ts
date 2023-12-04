export const delay = (t: number | undefined) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve;
    }, t);
  });
};
