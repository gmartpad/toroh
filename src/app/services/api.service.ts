import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { environment } from '@environments/environment' 

export interface Flashcard {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:' + environment.backend_port;
  private http = inject(HttpClient);

  uploadDocumentAndGetFlashcards(file: File): Observable<Flashcard[]> {
    // Programatically instantiating a FormData object
    const formData = new FormData();

    // Append the file to the FormData object into the 'documentFile' key
    formData.append('documentFile', file);

    // Create a subject to emit flashcards as they arrive
    const flashcardsSubject = new Subject<Flashcard[]>();
    // Store all flashcards in an array
    const allFlashcards: Flashcard[] = [];

    // Keep track of the subscription to the file upload and the EventSource
    let fileUploadSubscription: Subscription | null = null;
    let eventSource: EventSource | null = null;
    
    // First, upload the file using a POST request
    // This will return a sessionId (to use as reference to the uploaded file)
    fileUploadSubscription = this.http.post<{sessionId: string}>(`${this.apiUrl}/api/upload-document`, formData).subscribe({
      next: (response) => {
        // Then create an EventSource with a URL that 
        // includes a reference to the uploaded file
        eventSource = new EventSource(`${this.apiUrl}/api/generate-flashcards?sessionId=${response.sessionId}`);
        
        // Listen for flashcard events
        eventSource.addEventListener('flashcard', (event) => {
          try {
            // Parse the flashcard data into a Flashcard object
            const newFlashcard = JSON.parse(event.data) as Flashcard;
            // Add the new flashcard to the array
            allFlashcards.push(newFlashcard);
            // Emit the updated list of flashcards
            flashcardsSubject.next([...allFlashcards]);
          } catch (error) {
            console.error('Error parsing flashcard data:', error);
          }
        });
        
        // Listen for completion event
        eventSource.addEventListener('complete', () => {
          // Checks if there is an active EventSource
          if(eventSource) {
            // Close the EventSource
            eventSource.close();
            // Reset the reference to the EventSource to avoid memory leaks
            eventSource = null; 
          }
          // Checks if there is an active subscription
          if(fileUploadSubscription) {
            // Unsubscribe from the file upload subscription
            fileUploadSubscription.unsubscribe();
            // Reset the reference to the subscription to avoid memory leaks
            fileUploadSubscription = null; 
          }
          // Complete the subject
          flashcardsSubject.complete();
        });
        
        // Listen for error events
        eventSource.addEventListener('error', (error) => {
          console.error('EventSource error:', error);
          // Checks if there is an active EventSource
          if(eventSource) {
            // Close the EventSource
            eventSource.close();
            // Reset the reference to the EventSource to avoid memory leaks
            eventSource = null; 
          }
          // Checks if there is an active subscription
          if(fileUploadSubscription) {
            // Unsubscribe from the file upload subscription
            fileUploadSubscription.unsubscribe();
            // Reset the reference to the subscription to avoid memory leaks
            fileUploadSubscription = null; 
          }
          // Emit an error through the subject
          flashcardsSubject.error(new Error('Error receiving flashcards'));
          // Complete the subject
          flashcardsSubject.complete();
        });
      },
      error: (error) => {
        // Checks if there is an active subscription
        if(fileUploadSubscription) {
          // Unsubscribe from the file upload subscription
          fileUploadSubscription.unsubscribe();
          // Reset the reference to the subscription to avoid memory leaks
          fileUploadSubscription = null; 
        }
        console.error('Error uploading file:', error);
        // Emit an error through the subject
        flashcardsSubject.error(new Error('Failed to upload file'));
        // Complete the subject
        flashcardsSubject.complete();
      }
    });
    
    // Return an observable that wraps the subject
    return new Observable<Flashcard[]>((observer) => {
      // Subscribe to the subject
      const subscription = flashcardsSubject.subscribe(observer);

      // Return cleanup function
      return () => {
        alert('unsubscribing the service')
        console.log('unsubscribing the service')
        // Unsubscribe from the subject
        subscription.unsubscribe();
        // Checks if there is an active subscription
        if (fileUploadSubscription) {
          // Unsubscribe from the file upload subscription
          fileUploadSubscription.unsubscribe();
          // Reset the reference to the subscription to avoid memory leaks
          fileUploadSubscription = null;
        }
        // Checks if there is an active EventSource
        if (eventSource) {
          // Close the EventSource
          eventSource.close();
          // Reset the reference to the EventSource to avoid memory leaks
          eventSource = null;
        }
      }
    })
  }
}