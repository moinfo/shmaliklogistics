<?php

namespace App\Mail;

use App\Models\BillingDocument;
use App\Models\CompanySetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BillingDocumentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BillingDocument $document,
        public CompanySetting  $company,
        public string          $customMessage = '',
        public string          $emailSubject  = '',
    ) {}

    public function envelope(): Envelope
    {
        $fromName    = $this->company->company_name  ?? config('app.name');
        $fromAddress = $this->company->company_email ?: config('mail.from.address');

        return new Envelope(
            from:    new Address($fromAddress, $fromName),
            subject: $this->emailSubject ?: $this->defaultSubject(),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.billing-document');
    }

    public function attachments(): array
    {
        return [];
    }

    private function defaultSubject(): string
    {
        $labels = ['quote' => 'Quotation', 'proforma' => 'Proforma Invoice', 'invoice' => 'Invoice'];
        $label  = $labels[$this->document->type] ?? 'Document';
        return "{$label} {$this->document->document_number} from {$this->company->company_name}";
    }
}
