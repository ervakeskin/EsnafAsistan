"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setErrorMessage("Giris yapilamadi. Bilgilerini kontrol ederek tekrar dene.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-2">
        <section className="hidden space-y-4 md:block">
          <p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
            EsnafAsistan
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Dukkanini tek panelden yonet.
          </h1>
          <p className="text-lg text-slate-600">
            Siparis, stok, teslimat ve kasa takibini sade bir panelle aninda
            gor.
          </p>
        </section>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Giris Yap</CardTitle>
            <p className="text-base text-muted-foreground">
              Mail ve sifrenle paneline guvenli sekilde gir.
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Mail
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    placeholder="ornek@dukkan.com"
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 pl-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Sifre
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    placeholder="********"
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 pl-11 text-base"
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <Button className="h-12 w-full text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Giris yapiliyor
                  </>
                ) : (
                  "Panele Gir"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
