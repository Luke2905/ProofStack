import { NextResponse } from 'next/server';
import {
  loginUserInPostgres,
  registerUserInPostgres,
} from '@/lib/prisma';
import { RoleCategory, SeniorityLevel } from '@/types/portfolio';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getAuthUserFromRequest,
  signJwtToken,
} from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: authUser.userId,
        email: authUser.email,
        name: authUser.name,
        portfolioId: authUser.portfolioId,
      },
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({
        ok: true,
        message: 'Logout realizado com sucesso.',
      });
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        ...getAuthCookieOptions(0),
        maxAge: 0,
      });
      return response;
    }

    // REGISTER
    if (action === 'register') {
      const {
        name,
        email,
        password,
        headline,
        roleCategory,
        seniority,
        githubUsername,
      } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { ok: false, error: 'Nome, e-mail e senha são obrigatórios.' },
          { status: 400 }
        );
      }

      if (password.length < 4) {
        return NextResponse.json(
          { ok: false, error: 'A senha deve ter pelo menos 4 caracteres.' },
          { status: 400 }
        );
      }

      const result = await registerUserInPostgres({
        name,
        email,
        password,
        headline: headline || 'Desenvolvedor de Software',
        roleCategory: (roleCategory as RoleCategory) || 'Fullstack',
        seniority: (seniority as SeniorityLevel) || 'Pleno',
        githubUsername,
      });

      // Sign JWT with 7-day expiration
      const token = await signJwtToken({
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        portfolioId: result.portfolio.id,
      });

      const response = NextResponse.json({
        ok: true,
        user: result.user,
        portfolio: result.portfolio,
        token,
      });

      // Set HttpOnly, Secure, SameSite=Lax Cookie
      const cookieOpts = getAuthCookieOptions();
      response.cookies.set(cookieOpts.name, token, cookieOpts);

      return response;
    }

    // LOGIN
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json(
          { ok: false, error: 'Informe seu e-mail e senha.' },
          { status: 400 }
        );
      }

      const result = await loginUserInPostgres({ email, password });

      // Sign JWT with 7-day expiration
      const token = await signJwtToken({
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        portfolioId: result.portfolio.id,
      });

      const response = NextResponse.json({
        ok: true,
        user: result.user,
        portfolio: result.portfolio,
        token,
      });

      // Set HttpOnly, Secure, SameSite=Lax Cookie
      const cookieOpts = getAuthCookieOptions();
      response.cookies.set(cookieOpts.name, token, cookieOpts);

      return response;
    }

    return NextResponse.json(
      { ok: false, error: 'Ação de autenticação inválida.' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao processar autenticação.';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
