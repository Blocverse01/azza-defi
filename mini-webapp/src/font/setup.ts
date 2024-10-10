import localFont from "next/font/local";

export const subjectivityFont = localFont({
  src: [
    {
      path: "./Subjectivity.Extrabold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-subjectivity",
});
