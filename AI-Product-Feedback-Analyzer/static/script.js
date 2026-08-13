// Multi-Company Feedback Analyzer Client JS

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Initialize Empty Charts
    initCharts();

    // Event Listeners
    const targetCompanySelect = document.getElementById('target-company');
    if (targetCompanySelect) {
        targetCompanySelect.addEventListener('change', handleTargetCompanyChange);
    }

    const companyFilterSelect = document.getElementById('company-filter-select');
    if (companyFilterSelect) {
        companyFilterSelect.addEventListener('change', (e) => {
            fetchCompanyFeedback(e.target.value);
        });
    }

    const datasetForm = document.getElementById('company-dataset-form');
    if (datasetForm) {
        datasetForm.addEventListener('submit', handleDatasetSubmit);
    }

    // Initial Load
    fetchCompanyList();
    fetchCompanyFeedback('All Companies');
});

let sentimentChartInstance = null;
let categoryChartInstance = null;

function initCharts() {
    const sentimentCtx = document.getElementById('sentimentChart')?.getContext('2d');
    const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');

    if (sentimentCtx) {
        sentimentChartInstance = new Chart(sentimentCtx, {
            type: 'doughnut',
            data: {
                labels: ['😊 Positive', '😐 Neutral', '😡 Negative'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af', font: { family: 'Outfit', size: 13 } }
                    }
                }
            }
        });
    }

    if (categoryCtx) {
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'bar',
            data: {
                labels: ['Bug / Issue', 'Feature Request', 'UX Friction', 'Praise / Testimonial', 'General Feedback'],
                datasets: [{
                    label: 'Reviews',
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
                    y: { ticks: { color: '#9ca3af', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

function handleTargetCompanyChange(e) {
    const customWrapper = document.getElementById('custom-company-wrapper');
    if (e.target.value === 'CUSTOM') {
        customWrapper.style.display = 'block';
    } else {
        customWrapper.style.display = 'none';
    }
}

async function fetchCompanyList() {
    try {
        const response = await fetch('/api/companies');
        const result = await response.json();
        if (result.success && result.companies) {
            updateCompanyDropdowns(result.companies);
        }
    } catch (err) {
        console.error('Error fetching companies:', err);
    }
}

function updateCompanyDropdowns(companies) {
    const filterSelect = document.getElementById('company-filter-select');
    const targetSelect = document.getElementById('target-company');
    
    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = `<option value="All Companies">🏢 All Companies</option>` +
            companies.map(c => `<option value="${c}">${getCompanyEmoji(c)} ${c}</option>`).join('');
        filterSelect.value = currentVal || 'All Companies';
    }

    if (targetSelect) {
        const currentVal = targetSelect.value;
        const defaults = ['Flipkart', 'Myntra', 'Amazon', 'Swiggy', 'Zomato'];
        const allTarget = Array.from(new Set([...defaults, ...companies]));
        
        targetSelect.innerHTML = allTarget.map(c => `<option value="${c}">${c}</option>`).join('') +
            `<option value="CUSTOM">+ Add Custom Company</option>`;
        if (currentVal && currentVal !== 'CUSTOM') {
            targetSelect.value = currentVal;
        }
    }
}

function getCompanyEmoji(companyName) {
    const name = companyName.toLowerCase();
    if (name.includes('flipkart')) return '🛍️';
    if (name.includes('myntra')) return '👗';
    if (name.includes('amazon')) return '📦';
    if (name.includes('swiggy')) return '🍔';
    if (name.includes('zomato')) return '🍕';
    return '🏢';
}

async function fetchCompanyFeedback(companyFilter = 'All Companies') {
    try {
        const response = await fetch(`/api/feedback?company=${encodeURIComponent(companyFilter)}`);
        const result = await response.json();
        
        if (result.success) {
            renderFeedbackList(result.data);
            updateDashboardMetrics(result.metrics);
            updateCharts(result.data);
            updateCompanyReportCard(result);
            
            const activeLabel = document.getElementById('active-company-label');
            if (activeLabel) {
                activeLabel.textContent = companyFilter;
            }
        }
    } catch (error) {
        console.error('Error fetching feedback:', error);
    }
}

function updateCompanyReportCard(res) {
    if (!res || !res.metrics) return;

    const company = res.company || 'Flipkart';
    const metrics = res.metrics;

    // Title & Score Header Box
    const titleElem = document.getElementById('report-company-title');
    if (titleElem) titleElem.textContent = `📊 ${company} Feedback Analysis`;

    document.getElementById('report-positive-pct').textContent = `${metrics.positive_pct}%`;
    document.getElementById('report-negative-pct').textContent = `${metrics.negative_pct}%`;
    document.getElementById('report-neutral-pct').textContent = `${metrics.neutral_pct}%`;
    document.getElementById('report-rating').textContent = `${metrics.rating || '4.1/5'}`;

    // Sentiment Bars
    const barPos = document.getElementById('bar-positive');
    const barNeu = document.getElementById('bar-neutral');
    const barNeg = document.getElementById('bar-negative');
    
    if (barPos) barPos.style.width = `${metrics.positive_pct}%`;
    if (barNeu) barNeu.style.width = `${metrics.neutral_pct}%`;
    if (barNeg) barNeg.style.width = `${metrics.negative_pct}%`;

    document.getElementById('label-bar-positive').textContent = `${metrics.positive_pct}%`;
    document.getElementById('label-bar-neutral').textContent = `${metrics.neutral_pct}%`;
    document.getElementById('label-bar-negative').textContent = `${metrics.negative_pct}%`;

    // Main Customer Issues List
    const issuesList = document.getElementById('main-issues-list');
    if (issuesList && res.main_issues) {
        issuesList.innerHTML = res.main_issues.map(iss => `
            <li>${iss.name} — <strong>${iss.count} mentions</strong></li>
        `).join('');
    }

    // Most Mentioned Features List
    const featuresList = document.getElementById('most-features-list');
    if (featuresList && res.top_features) {
        featuresList.innerHTML = res.top_features.map(feat => `
            <li>${feat.name}</li>
        `).join('');
    }

    // Overall Company Analysis Box
    const summaryTitle = document.getElementById('summary-title-text');
    const summaryDetail = document.getElementById('summary-detail-text');
    if (summaryTitle) summaryTitle.textContent = metrics.summary_title;
    if (summaryDetail) summaryDetail.textContent = metrics.summary_detail;

    // AI Recommendations
    const recsList = document.getElementById('ai-recommendations-list');
    if (recsList && res.recommendations) {
        recsList.innerHTML = res.recommendations.map(rec => `
            <li>${rec}</li>
        `).join('');
    }
}


async function handleDatasetSubmit(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('dataset-file');
    const rawTextInput = document.getElementById('feedback-raw-text');
    const analyzeBtn = document.getElementById('analyze-btn');

    const file = fileInput.files ? fileInput.files[0] : null;
    const rawText = rawTextInput ? rawTextInput.value.trim() : '';

    if (!file && !rawText) {
        alert('Please either upload a dataset file (PDF, DOCX, CSV, Excel, TXT, JSON) or paste customer reviews text.');
        return;
    }

    const formData = new FormData();
    formData.append('source', file ? `File: ${file.name}` : 'Pasted Dataset Text');
    if (rawText) formData.append('raw_text', rawText);
    if (file) formData.append('file', file);

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Analyzing with AI...`;
    if (window.lucide) lucide.createIcons();

    try {
        const response = await fetch('/api/analyze-dataset', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.success) {
            if (rawTextInput) rawTextInput.value = '';
            if (fileInput) fileInput.value = '';
            
            // Redirect to dedicated report page
            window.location.href = '/report';
        } else {
            alert('Analysis Error: ' + (result.error || 'Failed to process dataset.'));
        }

    } catch (error) {
        console.error('Error analyzing dataset:', error);
        alert('An error occurred while analyzing the dataset.');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `<i data-lucide="brain"></i> Analyze Dataset & Generate Report`;
        if (window.lucide) lucide.createIcons();
    }
}


function renderFeedbackList(feedbackList) {
    const feedContainer = document.getElementById('feedback-feed');
    if (!feedContainer) return;

    if (!feedbackList || feedbackList.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="inbox"></i>
                <p>No feedback found for this company. Upload a dataset or select another company.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    feedContainer.innerHTML = feedbackList.map(item => `
        <div style="padding: 1rem; border-bottom: 1px solid var(--bg-card-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary);">
                    ${getCompanyEmoji(item.company)} ${item.company}
                </span>
                <span style="font-size: 0.75rem; color: var(--text-dim);">${new Date(item.created_at).toLocaleString()}</span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.6rem; line-height: 1.4;">
                "${item.content}"
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                <span style="font-size: 0.8rem; background: rgba(99,102,241,0.15); color: #ffffff; padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 600;">
                    ${item.sentiment_emoji || '😐'} ${item.sentiment}
                </span>
                <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); color: var(--text-muted); padding: 0.2rem 0.5rem; border-radius: 4px;">
                    Category: ${item.category}
                </span>
                <span style="font-size: 0.75rem; background: ${item.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}; color: ${item.priority === 'High' ? '#ef4444' : 'var(--text-dim)'}; padding: 0.2rem 0.5rem; border-radius: 4px;">
                    Priority: ${item.priority}
                </span>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function updateDashboardMetrics(metrics) {
    if (!metrics) return;

    document.getElementById('stat-total').textContent = metrics.total || 0;
    document.getElementById('stat-positive').textContent = `${metrics.positive_pct || 0}%`;
    document.getElementById('stat-neutral').textContent = `${metrics.neutral_pct || 0}%`;
    document.getElementById('stat-negative').textContent = `${metrics.negative_pct || 0}%`;

    const emojiBadge = document.getElementById('company-emoji-badge');
    if (emojiBadge) {
        emojiBadge.textContent = metrics.company_emoji || '🏢';
    }
}

function updateCharts(feedbackList) {
    if (!feedbackList) return;

    // Sentiment Counts
    const pos = feedbackList.filter(f => f.sentiment === 'Positive').length;
    const neu = feedbackList.filter(f => f.sentiment === 'Neutral').length;
    const neg = feedbackList.filter(f => f.sentiment === 'Negative').length;

    if (sentimentChartInstance) {
        sentimentChartInstance.data.datasets[0].data = [pos, neu, neg];
        sentimentChartInstance.update();
    }

    // Category Counts
    const categories = ['Bug / Issue', 'Feature Request', 'UX Friction', 'Praise / Testimonial', 'General Feedback'];
    const catCounts = categories.map(cat => feedbackList.filter(f => f.category === cat).length);

    if (categoryChartInstance) {
        categoryChartInstance.data.datasets[0].data = catCounts;
        categoryChartInstance.update();
    }
}

function loadCompanyDemo(company) {
    const targetSelect = document.getElementById('target-company');
    const rawText = document.getElementById('feedback-raw-text');
    
    if (targetSelect) targetSelect.value = company;
    handleTargetCompanyChange({ target: targetSelect });

    if (company === 'Flipkart') {
        rawText.value = `Flipkart Big Billion Days delivery was super fast! Absolutely love the discounts. 😊
The delivery executive was very polite and package was intact. 😍
Flipkart search filter is broken when searching for electronics, it keeps crashing. 😡
Refund process for returned shoes took more than 10 days. Very poor customer service. 🤬
Wish Flipkart would add an option to compare 3 mobile phones side by side.
Order tracking page did not update for two days straight, issue with live location. 😡`;
    } else if (company === 'Myntra') {
        rawText.value = `Myntra Insider points and discounts are amazing! 😍
Great quality clothes and easy 30-day exchange option. 😊
Myntra app crashed repeatedly when I tried applying coupon code at checkout! 😡
Size guide for women's dresses is wrong and inaccurate. Horrible fitting. 😡
Would be great if Myntra introduced AI try-on feature for outfits.
Fast delivery and nice eco-friendly packaging. 👍`;
    }
}

function exportData(type) {
    const filterSelect = document.getElementById('company-filter-select');
    const company = filterSelect ? filterSelect.value : 'All Companies';
    
    const url = `/api/export/${type}?company=${encodeURIComponent(company)}`;
    window.open(url, '_blank');
}

