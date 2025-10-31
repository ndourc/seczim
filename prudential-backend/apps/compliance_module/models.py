from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.core.models import SMI
import uuid

class ComplianceIndex(models.Model):
    """Compliance index and entity-level risk calibration"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    smi = models.ForeignKey(SMI, on_delete=models.CASCADE, related_name='compliance_indices')
    period = models.DateField(default=timezone.now)
    analysis_period = models.CharField(max_length=20, choices=[
        ('QUARTERLY', 'Quarterly'),
        ('ANNUAL', 'Annual')
    ], default='QUARTERLY')
    
    # Compliance Scores
    overall_compliance_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=75)
    regulatory_compliance = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=75)
    operational_compliance = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=75)
    financial_compliance = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=75)
    
    # Risk Calibration
    risk_calibration_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=75)
    risk_adjustment_factor = models.FloatField(help_text="Factor applied based on inspection results", default=1.0)
    
    # Post-inspection adjustments
    post_inspection_adjustment = models.FloatField(default=0)
    final_compliance_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=75)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Compliance Index - {self.smi.company_name} - {self.period}"

    class Meta:
        unique_together = ['smi', 'period', 'analysis_period']
        ordering = ['-period']

    def calculate_final_compliance_score(self):
        """Calculate final compliance score with post-inspection adjustments"""
        self.final_compliance_score = self.overall_compliance_score + self.post_inspection_adjustment
        self.final_compliance_score = max(0, min(100, self.final_compliance_score))  # Ensure within 0-100 range
        return self.final_compliance_score

class ComplianceAssessment(models.Model):
    """Comprehensive compliance assessment"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ESCALATED', 'Escalated')
    ]
    
    ASSESSMENT_TYPES = [
        ('REGULAR', 'Regular Assessment'),
        ('POST_INSPECTION', 'Post-Inspection Assessment'),
        ('TRIGGERED', 'Triggered Assessment'),
        ('FOLLOW_UP', 'Follow-up Assessment')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    smi = models.ForeignKey(SMI, on_delete=models.CASCADE, related_name='compliance_assessments')
    assessment_date = models.DateField(default=timezone.now)
    assessment_type = models.CharField(max_length=30, choices=ASSESSMENT_TYPES, default='REGULAR')
    
    # Assessment Details
    scope = models.TextField(default='Assessment scope to be defined')
    methodology = models.TextField(default='Assessment methodology to be documented')
    risk_areas = models.JSONField(default=dict, help_text="Areas like CDD, record-keeping, reporting compliance")
    
    # Findings and Results
    findings = models.TextField(default='Findings to be documented')
    compliance_gaps = models.TextField(blank=True)
    risk_rating = models.CharField(max_length=20, choices=[
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
        ('CRITICAL', 'Critical Risk')
    ], default='MEDIUM')
    
    # Recommendations and Actions
    recommendations = models.TextField(blank=True)
    action_items = models.JSONField(default=list, help_text="List of required actions")
    priority_actions = models.TextField(blank=True)
    
    # Status and Follow-up
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assessor = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Compliance Assessment - {self.smi.company_name} - {self.assessment_date}"

    class Meta:
        ordering = ['-assessment_date']

class ComplianceRequirement(models.Model):
    """Regulatory compliance requirements tracking"""
    REQUIREMENT_TYPES = [
        ('REGULATORY', 'Regulatory Requirement'),
        ('OPERATIONAL', 'Operational Requirement'),
        ('FINANCIAL', 'Financial Requirement'),
        ('REPORTING', 'Reporting Requirement'),
        ('TRAINING', 'Training Requirement'),
        ('DOCUMENTATION', 'Documentation Requirement')
    ]
    
    PRIORITY_LEVELS = [
        ('LOW', 'Low Priority'),
        ('MEDIUM', 'Medium Priority'),
        ('HIGH', 'High Priority'),
        ('CRITICAL', 'Critical Priority')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    smi = models.ForeignKey(SMI, on_delete=models.CASCADE, related_name='compliance_requirements')
    requirement_type = models.CharField(max_length=30, choices=REQUIREMENT_TYPES, default='REGULATORY')
    
    # Requirement Details
    title = models.CharField(max_length=255)
    description = models.TextField()
    regulatory_reference = models.CharField(max_length=255, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='MEDIUM')
    
    # Compliance Status
    is_compliant = models.BooleanField(default=False)
    compliance_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)], default=0)
    last_assessment_date = models.DateField(null=True, blank=True)
    
    # Timeline
    effective_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    compliance_date = models.DateField(null=True, blank=True)
    
    # Monitoring
    monitoring_frequency = models.CharField(max_length=20, choices=[
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('ANNUALLY', 'Annually')
    ], default='QUARTERLY')
    
    next_review_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.smi.company_name}"

    class Meta:
        ordering = ['due_date', 'priority']

class ComplianceViolation(models.Model):
    """Compliance violations and breaches"""
    VIOLATION_TYPES = [
        ('MINOR', 'Minor Violation'),
        ('MAJOR', 'Major Violation'),
        ('CRITICAL', 'Critical Violation'),
        ('REPEATED', 'Repeated Violation')
    ]
    
    SEVERITY_LEVELS = [
        ('LOW', 'Low Severity'),
        ('MEDIUM', 'Medium Severity'),
        ('HIGH', 'High Severity'),
        ('CRITICAL', 'Critical Severity')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    smi = models.ForeignKey(SMI, on_delete=models.CASCADE, related_name='compliance_violations')
    compliance_requirement = models.ForeignKey(ComplianceRequirement, on_delete=models.CASCADE, related_name='violations')
    
    # Violation Details
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES, default='MINOR')
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='MEDIUM')
    description = models.TextField()
    date_identified = models.DateField(default=timezone.now)
    
    # Investigation
    investigation_status = models.CharField(max_length=20, choices=[
        ('OPEN', 'Open'),
        ('INVESTIGATING', 'Investigating'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed')
    ], default='OPEN')
    
    root_cause = models.TextField(blank=True)
    impact_assessment = models.TextField(blank=True)
    
    # Resolution
    corrective_actions = models.TextField(blank=True)
    preventive_measures = models.TextField(blank=True)
    resolution_date = models.DateField(null=True, blank=True)
    
    # Follow-up
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    follow_up_status = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.violation_type} - {self.smi.company_name} - {self.date_identified}"

    class Meta:
        ordering = ['-date_identified']

class ComplianceReport(models.Model):
    """Compliance reporting and documentation"""
    REPORT_TYPES = [
        ('REGULAR', 'Regular Report'),
        ('INCIDENT', 'Incident Report'),
        ('VIOLATION', 'Violation Report'),
        ('REMEDIATION', 'Remediation Report'),
        ('ANNUAL', 'Annual Report')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    smi = models.ForeignKey(SMI, on_delete=models.CASCADE, related_name='compliance_reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES, default='REGULAR')
    
    # Report Details
    title = models.CharField(max_length=255)
    period_start = models.DateField()
    period_end = models.DateField()
    report_date = models.DateField(default=timezone.now)
    
    # Content
    executive_summary = models.TextField()
    findings = models.TextField()
    recommendations = models.TextField()
    action_items = models.JSONField(default=list)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('SUBMITTED', 'Submitted'),
        ('ARCHIVED', 'Archived')
    ], default='DRAFT')
    
    # Approval
    prepared_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='prepared_reports')
    reviewed_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_reports')
    approved_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_reports')
    
    # File
    report_file = models.FileField(upload_to='compliance_reports/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.smi.company_name} - {self.period_start} to {self.period_end}"

    class Meta:
        ordering = ['-report_date']
