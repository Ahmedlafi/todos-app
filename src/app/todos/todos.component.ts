import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TodosService, Todo } from '../services/todos.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../dialogs/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSlideToggleModule,
    DragDropModule,
  ],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  completed: Todo[] = [];
  loading = true;
  addingTodo = false;
  addTodoForm: FormGroup;

  constructor(
    private todosService: TodosService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.addTodoForm = this.fb.group({
      todo: ['', [Validators.required, Validators.minLength(3)]],
      completed: [false],
    });
  }

  ngOnInit() {
    this.fetchTodos();
  }

  fetchTodos() {
    this.todosService.getTodos().subscribe({
      next: (res) => {
        this.todos = res.todos.filter((t) => !t.completed);
        this.completed = res.todos.filter((t) => t.completed);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  drop(event: CdkDragDrop<Todo[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const previousList = event.previousContainer.id;
      const currentList = event.container.id;

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const item = event.container.data[event.currentIndex];
      const newStatus = currentList === 'completedList';

      item.completed = newStatus;

      this.todosService.updateTodo(item.id, newStatus).subscribe({
        next: (updatedTodo) => {
          this.showStatusUpdateFeedback(item.todo, newStatus);
        },
        error: (err) => {
          this.revertStatusChange(item, previousList, currentList);
          this.dialog.open(AlertDialogComponent, {
            data: {
              title: 'Error',
              message: 'Failed to update task status. Please try again.',
              type: 'error',
            },
          });
        },
      });
    }
  }

  private showStatusUpdateFeedback(taskText: string, isCompleted: boolean) {}

  private revertStatusChange(
    item: Todo,
    previousList: string,
    currentList: string
  ) {
    item.completed = !item.completed;

    if (previousList === 'todoList') {
      this.todos.push(item);
      this.completed = this.completed.filter((t) => t.id !== item.id);
    } else {
      this.completed.push(item);
      this.todos = this.todos.filter((t) => t.id !== item.id);
    }
  }

  viewDetails(id: string, event: Event) {
    if (event.type === 'click') {
      event.stopPropagation();
      event.preventDefault();
      this.router.navigate(['/todos', id]);
    }
  }

  onAddTodo() {
    if (this.addTodoForm.invalid) return;

    this.addingTodo = true;
    const todoText = this.addTodoForm.get('todo')?.value;
    const isCompleted = this.addTodoForm.get('completed')?.value;

    this.todosService.addTodo(todoText, 26).subscribe({
      next: (newTodo) => {
        newTodo.completed = isCompleted;

        if (isCompleted) {
          this.completed.push(newTodo);
        } else {
          this.todos.push(newTodo);
        }

        this.addTodoForm.reset({ todo: '', completed: false });
        this.addTodoForm.markAsUntouched();
        this.addTodoForm.markAsPristine();
        Object.keys(this.addTodoForm.controls).forEach((key) => {
          this.addTodoForm.get(key)?.setErrors(null);
        });
        this.addingTodo = false;

        this.dialog.open(AlertDialogComponent, {
          data: {
            title: 'Success',
            message: 'Task added successfully!',
            type: 'success',
            buttonText: 'OK',
          },
        });
      },
      error: (err) => {
        this.addingTodo = false;
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: 'Error',
            message: 'Failed to add the task. Please try again.',
            type: 'error',
          },
        });
      },
    });
  }

  deleteTodo(id: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message:
          'Are you sure you want to delete this task? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.todosService.deleteTodo(id).subscribe({
          next: () => {
            this.todos = this.todos.filter((todo) => todo.id !== id);
            this.completed = this.completed.filter((todo) => todo.id !== id);

            this.dialog.open(AlertDialogComponent, {
              data: {
                title: 'Success',
                message: 'Task deleted successfully!',
                type: 'success',
                buttonText: 'OK',
              },
            });
          },
          error: (err) => {
            this.dialog.open(AlertDialogComponent, {
              data: {
                title: 'Error',
                message: 'Failed to delete the task. Please try again.',
                type: 'error',
              },
            });
          },
        });
      }
    });
  }
}
