import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApiService, Flashcard } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatCardModule, MatButtonModule, CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [ApiService]
})
export class AppComponent {
  title = 'toroh';
  selectedFile: File | null = null;
  flashcards: Flashcard[] = [];
  isLoading = false;

  private apiService = inject(ApiService)

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
      
      this.apiService.uploadDocumentAndGetFlashcards(this.selectedFile).subscribe({
        next: (response: Flashcard[]) => {
          this.flashcards = response;
          console.log('Flashcards received:', this.flashcards);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating flashcards:', error);
          alert('Failed to create flashcards. See console for details.');
          this.isLoading = false;
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
}