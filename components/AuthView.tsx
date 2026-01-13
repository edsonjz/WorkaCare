import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, User, LifeBuoy, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const AuthView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="font-bold text-2xl text-white">W</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-slate-900">WorkaCare</span>
                    </div>
                    <p className="text-slate-500">
                        {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta para continuar'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg flex items-start gap-3 animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-lg flex items-start gap-3">
                                <LifeBuoy className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{success}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-4 rounded-xl text-base font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transform transition-all active:scale-[0.98]"
                            loading={loading}
                            icon={!loading && <ArrowRight className="w-5 h-5" />}
                        >
                            {isSignUp ? 'Criar Conta' : 'Entrar'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setSuccess(null);
                            }}
                            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Registre-se agora'}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                    Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                </p>
            </div>
        </div>
    );
};

export default AuthView;
