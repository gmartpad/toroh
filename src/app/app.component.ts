import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatCardModule, MatButtonModule], // Add MatButtonModule here
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'toroh';
  selectedFile: File | null = null;
  flashcards: { question: string, answer: string }[] = []; // Basic flashcard structure

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.selectedFile = file;
        console.log('Selected file:', this.selectedFile.name);
      } else {
        this.selectedFile = null;
        alert('Please select a .pdf or .docx file.');
        input.value = ''; // Reset the input
      }
    }
  }

  createFlashcards(): void {
    if (this.selectedFile) {
      console.log(`Preparing to create flashcards from: ${this.selectedFile.name}`);
      // TODO: Implement file upload to backend and Gemini AI integration
      // 1. Create a FormData object
      // const formData = new FormData();
      // formData.append('document', this.selectedFile, this.selectedFile.name);

      // 2. Send formData to your backend service
      // this.yourApiService.uploadDocumentAndGetFlashcards(formData).subscribe(
      //   (response: { question: string, answer: string }[]) => {
      //     this.flashcards = response;
      //     console.log('Flashcards received:', this.flashcards);
      //   },
      //   error => {
      //     console.error('Error creating flashcards:', error);
      //     alert('Failed to create flashcards. See console for details.');
      //   }
      // );

      // For now, let's simulate a response:
      alert(`Simulating flashcard creation for ${this.selectedFile.name}. Check console for next steps.`);
      this.flashcards = [
        { question: 'What is the capital of France?', answer: 'Paris' },
        { question: 'What is 2 + 2?', answer: '4' }
      ];
      this.selectedFile = null; // Clear selection after processing
      // Reset the file input visually if you have a direct reference to it
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } else {
      alert('Please select a file first.');
    }
  }
}