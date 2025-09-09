import { Metadata } from "next"
import Image from "next/image"
import { UserAuthForm } from "../Login/user-auth-form"
import { ReCaptchaProvider } from "next-recaptcha-v3";
import { env } from "process"


export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default function AuthenticationPage() {
  

  return (
    <ReCaptchaProvider reCaptchaKey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
      <div className="h-dvh overflow-hidden">
        <div className="md:hidden flex justify-center">
          <Image
            src="/icons/Kominfo.svg"
            width={210}
            height={83}
            alt="Kominfo"
            className="block dark:hidden"
          />
          <Image
            src="/icons/Kominfo.svg"
            width={210}
            height={83}
            alt="Kominfo"
            className="hidden dark:block"
          />
        </div>
        <div className="container relative block h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
          <div className="relative hidden h-svh flex-col bg-muted p-10 text-white lg:flex dark:border-r">
            <div className="lg:block absolute inset-0 bg-slate-900"/>
            <div className="relative z-20 flex items-center text-lg font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              SIM-LPU
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  © Copyright 2024. Kementerian Komunikasi Dan Informatika
                </p>
                <footer className="text-sm">SIM-LPU (Sistem Informasi Layanan Pos Universal)</footer>
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Selamat Datang Kembali!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Silakan masukkan informasi kredensial Anda di bawah ini dan mari lanjutkan bersama.
                </p>
              </div>
              <UserAuthForm />
              <p className="px-8 text-center text-sm text-muted-foreground">
              This site is protected by reCAPTCHA and the Google{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </ReCaptchaProvider>
  )
}