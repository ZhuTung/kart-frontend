import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../models/post';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-feed',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, ConfirmDialog],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly postService = inject(PostService);

  readonly currentUser = this.auth.currentUser;
  readonly posts = signal<Post[]>([]);
  readonly loading = signal(false);
  readonly posting = signal(false);
  readonly likingId = signal<number | null>(null);
  readonly error = signal('');
  readonly fieldErrors = signal<string[]>([]);
  readonly success = signal('');
  readonly previewUrl = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly deleteDialogOpen = signal(false);
  readonly deleteTargetId = signal<number | null>(null);
  readonly deleting = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(2000)],
  });

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.postService.getAll().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load feed');
        this.loading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.clearPreview();
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  clearPreview(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
    this.selectedFile.set(null);
  }

  isOwnPost(post: Post): boolean {
    return post.userId === this.currentUser()?.id;
  }

  mediaSrc(post: Post): string {
    return this.postService.mediaUrl(post.mediaUrl);
  }

  onSubmit(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Please select an image or video');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description } = this.form.getRawValue();
    this.posting.set(true);
    this.error.set('');
    this.fieldErrors.set([]);
    this.success.set('');

    this.postService.create(title, description, file).subscribe({
      next: (res) => {
        this.posts.update((list) => [res.post, ...list]);
        this.posting.set(false);
        this.success.set('Post shared!');
        this.form.reset({ title: '', description: '' });
        this.clearPreview();
      },
      error: (err) => {
        this.posting.set(false);
        this.error.set(err.error?.message || 'Failed to create post');
        if (err.error?.errors) {
          this.fieldErrors.set(err.error.errors);
        }
      },
    });
  }

  toggleLike(post: Post): void {
    if (this.likingId() !== null) return;

    this.likingId.set(post.id);
    this.postService.toggleLike(post.id).subscribe({
      next: (res) => {
        this.posts.update((list) =>
          list.map((p) =>
            p.id === post.id ? { ...p, likedByMe: res.liked, likeCount: res.likeCount } : p
          )
        );
        this.likingId.set(null);
      },
      error: () => {
        this.likingId.set(null);
        this.error.set('Failed to update like');
      },
    });
  }

  requestDelete(id: number): void {
    this.deleteTargetId.set(id);
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.deleteTargetId.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id === null) return;

    this.deleting.set(true);
    this.postService.delete(id).subscribe({
      next: () => {
        this.posts.update((list) => list.filter((p) => p.id !== id));
        this.deleting.set(false);
        this.cancelDelete();
      },
      error: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.error.set('Failed to delete post');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
