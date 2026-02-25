<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KorisnickaPoruka extends Mailable
{
    use Queueable, SerializesModels;


    public $primalac;
    public $poruka;

    /**
     * Create a new message instance.
     */
    public function __construct($primalac,$poruka)
    {
        $this->primalac=$primalac;
        $this->poruka=$poruka;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Korisnička poruka',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.korisnicka-poruka',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
    
        if(isset($this->poruka['slike'])){
            foreach($this->poruka['slike'] as $slika){
                $attachments[] = Attachment::fromPath($slika->getRealPath())
                    ->as($slika->getClientOriginalName())
                    ->withMime($slika->getMimeType());
            }
        }
        
        return $attachments;
    }
}
