import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApiService, Flashcard } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    MatCardModule, 
    MatButtonModule, 
    CommonModule, 
    HttpClientModule,
  ],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ApiService],
  animations: [
    trigger('flipState', [
      state('front', style({
        transform: 'rotateY(0)'
      })),
      state('back', style({
        transform: 'rotateY(180deg)'
      })),
      transition('front => back', animate('400ms ease-in')),
      transition('back => front', animate('400ms ease-out'))
    ])
  ]
})
export class AppComponent implements OnDestroy {
  title = 'toroh';
  selectedFile: File | null = null;
  flashcards: Flashcard[] = [
    {
        "question": "Segundo o livro mencionado, como as jibóias se alimentam e o que fazem após a refeição?",
        "answer": "As jibóias engolem a presa inteira, sem mastigar. Em seguida, não podem mover-se e dormem durante os seis meses da digestão."
    },
    {
        "question": "O que o narrador desenhou em seu 'desenho número 1'?",
        "answer": "Ele desenhou uma jibóia digerindo um elefante."
    },
    {
        "question": "Como as 'pessoas grandes' interpretaram o 'desenho número 1' do narrador?",
        "answer": "Elas interpretaram o desenho como um chapéu."
    },
    {
        "question": "Por que o narrador fez o 'desenho número 2'?",
        "answer": "Ele desenhou o interior da jibóia para que as 'pessoas grandes' pudessem compreender que seu primeiro desenho não era um chapéu, mas uma jibóia digerindo um elefante, já que elas têm sempre necessidade de explicações."
    },
    {
        "question": "Qual foi o conselho das 'pessoas grandes' ao narrador em relação aos seus desenhos?",
        "answer": "Aconselharam-no a deixar de lado os desenhos de jibóias abertas ou fechadas e a dedicar-se de preferência à geografia, à história, ao cálculo e à gramática."
    },
    {
        "question": "Qual foi a consequência do insucesso dos seus desenhos para a carreira que o narrador imaginava?",
        "answer": "Ele abandonou, aos seis anos, uma esplêndida carreira de pintor, pois fora desencorajado pelo insucesso dos seus desenhos número 1 e número 2."
    },
    {
        "question": "Qual é a opinião do narrador sobre a capacidade de compreensão das 'pessoas grandes'?",
        "answer": "Ele acha que as 'pessoas grandes' não compreendem nada sozinhas e que é cansativo para as crianças estar toda hora explicando as coisas para elas."
    },
    {
        "question": "Que profissão o narrador escolheu após abandonar a pintura?",
        "answer": "Ele aprendeu a pilotar aviões."
    },
    {
        "question": "De que forma a geografia foi útil para o narrador em sua vida adulta?",
        "answer": "A geografia lhe serviu muito, pois ele sabia distinguir, num relance, lugares como a China e o Arizona, o que era muito útil quando se estava perdido na noite."
    },
    {
        "question": "A convivência com 'muita gente séria' mudou a opinião do narrador sobre as 'pessoas grandes'?",
        "answer": "Não, ver as 'pessoas grandes' muito de perto não melhorou, de modo algum, a sua antiga opinião sobre elas."
    },
    {
        "question": "Que teste o narrador aplicava quando encontrava uma 'pessoa grande' que lhe parecia um pouco lúcida?",
        "answer": "Ele fazia com ela a experiência do seu 'desenho número 1', que sempre conservara."
    }
];
  isLoading = false;

  // Track flip state for each card
  cardFlipStates: { [key: string]: 'front' | 'back' } = {};

  private apiService = inject(ApiService)
  private flashcardsSubscription: Subscription | null = null

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
        console.log('Selected file:', this.selectedFile.name);
      } else {
        this.selectedFile = null;
        alert('Invalid file type. Please select a .pdf or .docx file.');
        input.value = ''; // Reset the file input
      }
    } else {
      this.selectedFile = null; // No file selected or selection cancelled
    }
  }

  createFlashcards(): void {
    if (this.selectedFile) {
      console.log(`Preparing to create flashcards from: ${this.selectedFile.name}`);
      this.isLoading = true;
      this.flashcards = []; // Clear existing flashcards
      
      this.flashcardsSubscription = this.apiService.uploadDocumentAndGetFlashcards(this.selectedFile).subscribe({
        next: (response: Flashcard[]) => {
          console.log('Flashcards response: ', response)
          this.flashcards = response;
          
          // Initialize flip states for all cards to 'front'
          this.flashcards.forEach(card => {
            this.cardFlipStates[card.question] = 'front';
          });
        },
        error: (error) => {
          console.error('Error creating flashcards:', error);
          alert('Failed to create flashcards. See console for details.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          console.log('Flashcard generation completed');
        }
      });
  
      // Reset the file input after sending
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      this.selectedFile = null;
    } else {
      alert('Please select a file first.');
    }
  }

  // Toggle card flip state
  toggleFlip(question: string): void {
    this.cardFlipStates[question] = this.cardFlipStates[question] === 'front' ? 'back' : 'front';
  }

  ngOnDestroy() {
    if (this.flashcardsSubscription) {
      this.flashcardsSubscription.unsubscribe();
      this.flashcardsSubscription = null;
    }
  }
}