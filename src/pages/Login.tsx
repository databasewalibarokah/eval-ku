import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    setLoading(true);
    
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (signInError) {
      console.log(signInError)
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    if (authData.session) {
      // Small delay to allow onAuthStateChange to trigger and set loading state in store
      // This helps the ProtectedRoute see the loading state correctly.
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] py-12 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-[#b4e6e9]/40 rounded-full blur-[100px] absolute top-[-100px] left-[-100px]" />
        <div className="w-[400px] h-[400px] bg-[#cce8e4]/50 rounded-full blur-[80px] absolute bottom-[-50px] right-[-50px]" />
      </div>

      <div className="max-w-md w-full space-y-6 sm:space-y-10 glass-card p-6 sm:p-10 z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl sm:text-5xl font-extrabold text-primary font-display tracking-tight">
            EvalKU
          </h2>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 font-medium tracking-wide uppercase">
            Sistem Evaluasi dan Seleksi
          </p>
        </div>
        
        {error && (
          <div className="bg-[#ba1a1a]/10 text-[#ba1a1a] p-4 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-6 sm:space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#171c1f] mb-2 font-display ml-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="block w-full input-field"
                placeholder="admin@app.com"
              />
              {errors.email && (
                 <p className="text-[#ba1a1a] text-xs font-medium mt-1.5 ml-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#171c1f] mb-2 font-display ml-1">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="block w-full input-field"
                placeholder="******"
              />
              {errors.password && (
                 <p className="text-[#ba1a1a] text-xs font-medium mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center btn-primary disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
