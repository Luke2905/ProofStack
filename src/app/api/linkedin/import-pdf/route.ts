import { NextResponse } from 'next/server';
import { parseLinkedInRawText } from '@/lib/linkedinParser';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        {
          success: false,
          error: 'O corpo da requisição deve ser multipart/form-data com o arquivo PDF',
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo PDF foi enviado' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O arquivo PDF enviado está vazio' },
        { status: 400 }
      );
    }

    // Direct require of pdf-parse lib to avoid test execution in index.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require('pdf-parse/lib/pdf-parse.js');
    const parsedPdf = await pdf(buffer);
    const rawText = parsedPdf?.text || '';

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Não foi possível extrair o texto do PDF. Certifique-se de que é o PDF gerado pelo botão "Salvar como PDF" do LinkedIn.',
        },
        { status: 422 }
      );
    }

    const parsedData = parseLinkedInRawText(rawText);

    return NextResponse.json({
      success: true,
      message: 'PDF do LinkedIn processado com sucesso!',
      data: parsedData,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha ao processar PDF do LinkedIn';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
