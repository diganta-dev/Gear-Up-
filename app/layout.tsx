
import { Inter, Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

import { getMe } from "@/service/getme";
import Navbar from "@/components/shered/navbar";
import Footer from "@/components/shered/footer";
import Providers from "@/components/providers";
import { IUser } from "@/types/user";

const notoSansHeading = Noto_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
const user = await getMe()
  
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", inter.variable, notoSansHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <Navbar user={user}></Navbar>
          <Toaster position="top-right" theme="dark" />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
