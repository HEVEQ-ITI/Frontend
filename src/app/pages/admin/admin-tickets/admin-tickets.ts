import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AdminTicketsService } from '../../../core/services/adminTicketsService';
import { AdminTicket, AdminTicketDetails } from '../../../core/models/admin.models';
import { Loading } from '../../../shared/components/loading/loading';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ActionModal } from '../../../shared/components/action-modal/action-modal';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-tickets',
  imports: [CommonModule, FormsModule, Loading, EmptyState, ActionModal, Pagination],
  templateUrl: './admin-tickets.html',
  styleUrl: './admin-tickets.css'
})
export class AdminTickets implements OnInit {
  tickets: AdminTicket[] = [];
  isLoading = true;
  
  // Filters
  filterStatus: string = 'Open'; // Default to Open/InProgress
  filterPriority: string = '';
  page = 1;
  pageSize = 15;
  totalCount = 0;

  // Selected Ticket View
  selectedTicket: AdminTicketDetails | null = null;
  isDetailsLoading = false;
  
  // Chat Reply
  replyContent = '';
  isReplying = false;

  // Modal
  isModalOpen = false;
  modalTitle = '';
  modalDesc = '';
  modalConfirmText = '';
  modalConfirmColor: 'primary' | 'danger' | 'success' = 'primary';
  requireNote = false;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  private destroyRef = inject(DestroyRef);

  constructor(
    private ticketsService: AdminTicketsService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.isLoading = true;
    this.ticketsService.getTickets(this.page, this.pageSize, this.filterStatus || undefined, this.filterPriority || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        this.tickets = res.items || [];
        this.totalCount = res.totalCount || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('فشل في تحميل التذاكر');
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange() {
    this.page = 1;
    this.selectedTicket = null;
    this.loadTickets();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadTickets();
  }

  viewTicket(id: string) {
    this.isDetailsLoading = true;
    this.ticketsService.getTicketDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        this.selectedTicket = res;
        this.isDetailsLoading = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDetailsLoading = false;
        this.toastService.error('فشل في تحميل تفاصيل التذكرة');
        this.cdr.detectChanges();
      }
    });
  }

  closeTicket() {
    this.selectedTicket = null;
    this.replyContent = '';
  }

  sendReply() {
    if (!this.selectedTicket || !this.replyContent.trim()) return;
    
    this.isReplying = true;
    this.ticketsService.addMessage(this.selectedTicket.id, { content: this.replyContent })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (msg) => {
        this.selectedTicket?.messages.push(msg);
        this.replyContent = '';
        this.isReplying = false;
        this.scrollToBottom();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isReplying = false;
        this.toastService.error('فشل في إرسال الرد');
        this.cdr.detectChanges();
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.chatContainer) {
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        }
      } catch(err) { }
    }, 100);
  }

  openResolveModal() {
    if (!this.selectedTicket) return;
    this.modalTitle = 'حل التذكرة وإغلاقها';
    this.modalDesc = `هل تم حل مشكلة "${this.selectedTicket.title}" بالكامل؟ يرجى ترك ملاحظة ختامية للمستخدم.`;
    this.modalConfirmText = 'حل التذكرة';
    this.modalConfirmColor = 'success';
    this.requireNote = true;
    this.isModalOpen = true;
  }

  handleModalConfirm(note?: string) {
    if (!this.selectedTicket) return;

    this.ticketsService.resolveTicket(this.selectedTicket.id, { resolutionNote: note || '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.selectedTicket!.status = 'Resolved'; // optimistic update
        this.isModalOpen = false;
        this.toastService.success('تم حل التذكرة بنجاح');
        this.loadTickets(); // refresh list
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Resolve failed', err);
        this.toastService.error('فشل في حل التذكرة');
        this.cdr.detectChanges();
      }
    });
  }
}
