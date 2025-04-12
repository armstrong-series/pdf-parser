import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import { ParsedData } from '../../interfaces/ParsedData.interface';

interface PdfParseResult {
  text: string;
}

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  async extractFileInfo(fileBuffer: Buffer): Promise<ParsedData> {
    try {
      this.logger.debug(
        `Starting PDF parsing, buffer size: ${fileBuffer.length} bytes`,
      );

      if (fileBuffer.length === 0) {
        this.logger.error('Empty buffer received');
        throw new Error('Empty PDF buffer');
      }
      if (!fileBuffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
        this.logger.error('Invalid PDF header');
        throw new Error('Not a valid PDF file');
      }

      const data = (await pdfParse(fileBuffer)) as PdfParseResult;
      this.logger.debug(
        `PDF parsed, text length: ${data.text.length} characters`,
      );
      this.logger.debug(
        `Raw PDF text (first 500 chars): ${data.text.slice(0, 500)}...`,
      );

      const text = data.text;

      const propertyNameMatch =
        text.match(/(\d+\s+[A-Za-z\s\-]+)/i) ||
        text.match(/(?:Property\s*(?:Name|:)|\b)([A-Za-z0-9\s\-]+)(?=\n)/i);
      let propertyName = 'Unknown';
      if (propertyNameMatch && propertyNameMatch[1]) {
        propertyName = propertyNameMatch[1].trim();
      }
      this.logger.debug(
        `Property name match: ${JSON.stringify(propertyNameMatch)}`,
      );
      this.logger.debug(`Property name: ${propertyName}`);

      const addressMatch =
        text.match(
          /([A-Za-z0-9\s,\-]+(?:BROOKLYN|NEW YORK CITY|RED HOOK|MANHATTAN|QUEENS|BRONX|NY|NEW YORK))/i,
        ) || text.match(/([A-Za-z0-9\s,\-]+\b(?:[A-Z]{2}\b|\d{5}))/i);
      let address = 'Unknown';
      if (addressMatch && addressMatch[1]) {
        address = addressMatch[1].trim();
        if (propertyName !== 'Unknown' && !address.includes(propertyName)) {
          address = `${propertyName}, ${address}`;
        }
      }
      this.logger.debug(`Address match: ${JSON.stringify(addressMatch)}`);
      this.logger.debug(`Address: ${address}`);

      const squareFootageMatch =
        text.match(/(?:Total\s*\/\s*W\.A\s*\|\s*)([\d,]+)/i) ||
        text.match(/([\d,]+)\s*(?:SF|square\s*feet|sq\s*ft)/i) ||
        text.match(/(?:Total\s*(?:Rentable\s*|Area\s*|SF\s*|:)|\b)([\d,]+)/i);
      let totalSquareFoot = 'Unknown';
      if (squareFootageMatch && squareFootageMatch[1]) {
        totalSquareFoot = squareFootageMatch[1].replace(/,/g, '');
      }
      this.logger.debug(
        `Square footage match: ${JSON.stringify(squareFootageMatch)}`,
      );
      this.logger.debug(`Total square foot: ${totalSquareFoot}`);

      const result: ParsedData = { propertyName, address, totalSquareFoot };
      this.logger.debug(`Parsed data: ${JSON.stringify(result)}`);

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Failed to parse PDF: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new Error(`Unable to parse PDF file: ${errorMessage}`);
    }
  }
}
