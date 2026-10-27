import { NextResponse } from 'next/server';
import {
  fetchAllPortfoliosFromPostgres,
  upsertPortfolioInPostgres,
} from '@/lib/prisma';
import { PortfolioProfile } from '@/types/portfolio';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const portfolios = await fetchAllPortfoliosFromPostgres();
    return NextResponse.json({
      connected: true,
      portfolios,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha ao buscar portfólios no banco';
    return NextResponse.json(
      {
        connected: false,
        error: message,
        portfolios: [],
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify cryptographic JWT token & 7-day expiration
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        {
          connected: false,
          error:
            'Acesso não autorizado: Sessão inexistente ou token JWT expirado. Faça login novamente.',
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { portfolio: PortfolioProfile };
    if (!body?.portfolio?.id) {
      return NextResponse.json(
        { connected: false, error: 'Payload inválido' },
        { status: 400 }
      );
    }

    // 2. Strict ID ownership validation: Token owner can only mutate their own portfolio
    if (authUser.portfolioId !== body.portfolio.id) {
      return NextResponse.json(
        {
          connected: false,
          error:
            'Acesso proibido: Você só tem permissão para atualizar o seu próprio portfólio.',
        },
        { status: 403 }
      );
    }

    await upsertPortfolioInPostgres(body.portfolio);
    return NextResponse.json({
      connected: true,
      savedId: body.portfolio.id,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erro ao persistir portfólio no banco';
    return NextResponse.json(
      {
        connected: false,
        error: message,
      },
      { status: 200 }
    );
  }
}
