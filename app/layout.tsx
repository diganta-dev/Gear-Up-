
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

import { getMe } from "@/service/getme";
import Navbar from "@/components/shered/navbar";
import Providers from "@/components/providers";
import { IUser } from "@/types/user";

const notoSansHeading = Noto_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
const user:IUser = await getMe()
  console.log(user)
  
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", inter.variable, notoSansHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar user={user}></Navbar>
          <Toaster position="top-right" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}
