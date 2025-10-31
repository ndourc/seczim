'use client'
import {
  calculateCAR,
  calculateGrossMargin,
  calculateProfitMargin,
  calculateWorkingCapital,
} from "@/lib/company";
import { OffsiteFormData } from "@/types/company";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Package,
  Save,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import StepIndicator from "./stepIndicator";
import BoardCommitteesStep from "./boardCommitStep";
import ProductsClientsStep from "./productClientStep";
import FinancialStatementsStep from "./financialStatementStep";
import BalanceSheetStep from "./balanceSheetStep";
import DocumentUploadStep from "./documentUploadStep";
import ReviewSubmitStep from "./review&SubmitStep";
import ClientAssetsCapitalStep from "./modals/clientCapitalStep";

const OffsiteProfilingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState<OffsiteFormData>({
    companyId: "COMPANY-001", // This would come from props or context
    reportingPeriod: {
      start: "",
      end: "",
    },
    boardMembers: [],
    committees: [],
    products: [],
    clients: [],
    financialStatement: {
      periodStart: "",
      periodEnd: "",
      totalRevenue: 0,
      operatingCosts: 0,
      profitBeforeTax: 0,
      grossMargin: 0,
      profitMargin: 0,
      incomeItems: [],
    },
    balanceSheet: {
      periodEnd: "",
      shareholdersFunds: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      currentAssets: 0,
      currentLiabilities: 0,
      workingCapital: 0,
      cashCover: 0,
      assets: [],
      liabilities: [],
      debtors: [],
      creditors: [],
      relatedParties: [],
    },
    clientAssets: [],
    capitalPosition: {
      calculationDate: "",
      netCapital: 0,
      requiredCapital: 0,
      adjustedLiquidCapital: 0,
      isCompliant: false,
      capitalAdequacyRatio: 0,
    },
    supportingDocuments: [],
  });

  const steps = [
    { id: 1, title: "Board & Committees", icon: Users },
    { id: 2, title: "Products & Clients", icon: Package },
    { id: 3, title: "Financial Statements", icon: FileText },
    { id: 4, title: "Balance Sheet", icon: FileSpreadsheet },
    { id: 5, title: "Assets & Capital", icon: TrendingUp },
    { id: 6, title: "Documents", icon: Upload },
    { id: 7, title: "Review & Submit", icon: CheckCircle },
  ];

  const validateStep = (step: number): boolean => {
    setValidationErrors({});

    try {
      switch (step) {
        case 1:
          if (formData.boardMembers.length === 0) {
            setValidationErrors({
              boardMembers: "At least one board member is required",
            });
            return false;
          }
          if (formData.committees.length === 0) {
            setValidationErrors({
              committees: "At least one committee is required",
            });
            return false;
          }
          break;
        case 2:
          if (formData.products.length === 0) {
            setValidationErrors({
              products: "At least one product is required",
            });
            return false;
          }
          if (formData.clients.length === 0) {
            setValidationErrors({ clients: "At least one client is required" });
            return false;
          }
          break;
        case 3:
          if (
            !formData.financialStatement.periodStart ||
            !formData.financialStatement.periodEnd
          ) {
            setValidationErrors({
              periodStart: "Reporting period is required",
            });
            return false;
          }
          if (formData.financialStatement.incomeItems.length === 0) {
            setValidationErrors({
              incomeItems: "At least one income item is required",
            });
            return false;
          }
          break;
        case 4:
          if (formData.balanceSheet.assets.length === 0) {
            setValidationErrors({ assets: "At least one asset is required" });
            return false;
          }
          if (formData.balanceSheet.liabilities.length === 0) {
            setValidationErrors({
              liabilities: "At least one liability is required",
            });
            return false;
          }
          break;
        case 5:
          if (formData.clientAssets.length === 0) {
            setValidationErrors({
              clientAssets: "At least one client asset type is required",
            });
            return false;
          }
          if (!formData.capitalPosition.calculationDate) {
            setValidationErrors({
              capitalPosition: {
                calculationDate: "Calculation date is required",
              },
            });
            return false;
          }
          break;
      }
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prepareDataForBackend = () => {
    // Calculate working capital
    const workingCapital = calculateWorkingCapital(
      formData.balanceSheet.currentAssets,
      formData.balanceSheet.currentLiabilities
    );

    // Calculate CAR
    const car = calculateCAR(
      formData.capitalPosition.netCapital,
      formData.capitalPosition.requiredCapital
    );

    // Determine compliance
    const isCompliant =
      formData.capitalPosition.netCapital >=
      formData.capitalPosition.requiredCapital;

    // Calculate margins
    const grossMargin = calculateGrossMargin(
      formData.financialStatement.totalRevenue,
      formData.financialStatement.operatingCosts
    );
    const profitMargin = calculateProfitMargin(
      formData.financialStatement.profitBeforeTax,
      formData.financialStatement.totalRevenue
    );

    return {
      companyId: formData.companyId,
      reportingPeriod: formData.reportingPeriod,
      boardMembers: formData.boardMembers,
      committees: formData.committees,
      products: formData.products,
      clients: formData.clients,
      financialStatement: {
        ...formData.financialStatement,
        grossMargin,
        profitMargin,
      },
      balanceSheet: {
        ...formData.balanceSheet,
        workingCapital,
      },
      clientAssets: formData.clientAssets,
      capitalPosition: {
        ...formData.capitalPosition,
        capitalAdequacyRatio: car,
        isCompliant,
      },
      metadata: {
        submittedAt: new Date().toISOString(),
        totalBoardMembers: formData.boardMembers.length,
        totalCommittees: formData.committees.length,
        totalProducts: formData.products.length,
        totalClients: formData.clients.length,
        totalIncomeItems: formData.financialStatement.incomeItems.length,
        totalAssets: formData.balanceSheet.assets.length,
        totalLiabilities: formData.balanceSheet.liabilities.length,
        totalClientAssetTypes: formData.clientAssets.length,
        totalDocuments: formData.supportingDocuments.length,
      },
    };
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for backend
      const backendData = prepareDataForBackend();

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append JSON data
      formDataToSend.append("data", JSON.stringify(backendData));

      // Append files
      formData.supportingDocuments.forEach((file, index) => {
        formDataToSend.append(`files[${index}]`, file);
      });
      console.log("Submitting data:", formDataToSend);
      // Make API call
      const response = await fetch("/api/offsite/submit", {
        method: "POST",
        body: formDataToSend,
        headers: {
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const result = await response.json();
      console.log("Submission successful:", result);

      setSubmitSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save draft functionality
  const handleSaveDraft = () => {
    const draftData = prepareDataForBackend();
    localStorage.setItem("offsite_profiling_draft", JSON.stringify(draftData));
    alert("Draft saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Institutional Profiling
          </h1>
          <p className="text-gray-600">
            Complete all sections to submit your institutional profile for
            offsite supervision
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form Content */}
        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === 1 && (
            <BoardCommitteesStep
              data={{
                boardMembers: formData.boardMembers,
                committees: formData.committees,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
              errors={validationErrors}
            />
          )}

          {currentStep === 2 && (
            <ProductsClientsStep
              data={{
                products: formData.products,
                clients: formData.clients,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
              errors={validationErrors}
            />
          )}

          {currentStep === 3 && (
            <FinancialStatementsStep
              data={formData.financialStatement}
              onChange={(financialStatement) =>
                setFormData({ ...formData, financialStatement })
              }
              errors={validationErrors}
            />
          )}

          {currentStep === 4 && (
            <BalanceSheetStep
              data={formData.balanceSheet}
              onChange={(balanceSheet) =>
                setFormData({ ...formData, balanceSheet })
              }
              errors={validationErrors}
            />
          )}

          {currentStep === 5 && (
            <ClientAssetsCapitalStep
              data={{
                clientAssets: formData.clientAssets,
                capitalPosition: formData.capitalPosition,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
              errors={validationErrors}
            />
          )}

          {currentStep === 6 && (
            <DocumentUploadStep
              files={formData.supportingDocuments}
              onChange={(supportingDocuments) =>
                setFormData({ ...formData, supportingDocuments })
              }
              errors={validationErrors}
            />
          )}

          {currentStep === 7 && <ReviewSubmitStep data={formData} />}

          {/* Navigation Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Draft
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex items-center px-6 py-3 text-white rounded-lg transition-colors ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Submit Profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Submission Error
                  </p>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Success Modal */}
        {submitSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Submission Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your offsite institutional profile has been submitted
                successfully. You will be redirected shortly.
              </p>
              <div className="animate-pulse">
                <div className="h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffsiteProfilingForm;
