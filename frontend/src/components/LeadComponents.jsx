import React, { useState } from 'react';
import { Eye, X, RefreshCw, Download, AlertTriangle, CheckCircle2, ChevronRight, Calendar, TrendingUp } from 'lucide-react';

// Mock active program leads data matching the reference image
const ACTIVE_LEADS = [
  {
    id: 'PSBLEAD042006',
    company: 'TATA MOTORS LIMITED',
    leadDate: '16-01-2026',
    typeOfLead: 'Program Lead',
    programName: '-',
    lenders: [
      { name: 'STATE BANK OF INDIA', short: 'SBI' },
      { name: 'CENTRAL BANK OF INDIA', short: 'CBI' },
    ],
    product: 'DF',
    ageing: 31,
    status: 'Offer Submitted',
  },
  {
    id: 'PSBLEAD042121',
    company: 'TATA MOTORS LIMITED',
    leadDate: '20-01-2026',
    typeOfLead: 'Program Lead',
    programName: '-',
    lenders: [
      { name: 'CENTRAL BANK OF INDIA', short: 'CBI' },
    ],
    product: 'DF',
    ageing: 12,
    status: 'Offer Submitted',
  },
  {
    id: 'PSBLEAD041890',
    company: 'TATA MOTORS LIMITED',
    leadDate: '05-01-2026',
    typeOfLead: 'Program Lead',
    programName: 'Dealer Finance Q1',
    lenders: [
      { name: 'STATE BANK OF INDIA', short: 'SBI' },
    ],
    product: 'DF',
    ageing: 42,
    status: 'Under Review',
  },
  {
    id: 'PSBLEAD041750',
    company: 'TATA MOTORS LIMITED',
    leadDate: '28-12-2025',
    typeOfLead: 'Program Lead',
    programName: 'Vendor Finance Program',
    lenders: [
      { name: 'HDFC BANK', short: 'HDFC' },
      { name: 'CENTRAL BANK OF INDIA', short: 'CBI' },
    ],
    product: 'VF',
    ageing: 50,
    status: 'Approved',
  },
];

const OFFER_DETAILS = {
  'PSBLEAD042006': {
    leadId: 'PSBLEAD042006',
    product: 'DF',
    leadType: 'Program Lead',
    lenders: [
      {
        id: 'CBI',
        name: 'CENTRAL BANK OF INDIA',
        role: 'Main Lending Partner',
        status: 'Offer Submitted',
        platformId: 'LENDER0004',
        programName: 'CBI SBIOPX PROGRAM',
        programLimit: '₹ 9,00,00,000',
        programROI: '8.00%',
        roiTag: 'Competitive',
        currentBenchmark: '5.00%',
        roiSpread: '3.00%',
        benchmarkCode: 'MCLR - 3M',
        penalInterest: '5.00%',
        tenor: '90 Days',
        interestType: 'Monthly Compounding',
        minCPLimit: '₹ 900',
        maxCPLimit: '₹ 80,000',
        offerActivePeriod: '7 Days',
        offerDate: '04-07-2025',
        fldg: '50%',
        fldgNote: 'Offered by Anchor Corporate',
        gracePeriod: '4 Days',
        stopSupply: '10 Days',
        staleInvoice: '5 Days',
        tnc: ['TnC 1 - Minimum invoice value ₹50,000 per transaction', 'TnC 2 - All invoices must be GST compliant', 'TnC 3 - Repayment within program tenor mandatory'],
      },
      {
        id: 'SBI',
        name: 'STATE BANK OF INDIA',
        role: 'Secondary Partner',
        status: 'Lender Rejected',
        platformId: 'LENDER0031',
        programName: 'SHRI FIN SB',
        rejectionRemark: 'Rejected Case: Credit profile does not meet minimum threshold for program SHRI FIN SB.',
        fldg: 'Not Applicable',
        gracePeriod: 'Not Applicable',
        stopSupply: 'Not Applicable',
        staleInvoice: 'Not Applicable',
      },
    ],
    lastUpdated: '14 mins ago',
  },
  'PSBLEAD042121': {
    leadId: 'PSBLEAD042121',
    product: 'DF',
    leadType: 'Program Lead',
    lenders: [
      {
        id: 'CBI',
        name: 'CENTRAL BANK OF INDIA',
        role: 'Main Lending Partner',
        status: 'Offer Submitted',
        platformId: 'LENDER0004',
        programName: 'CBI DEALER FINANCE PROGRAM',
        programLimit: '₹ 5,00,00,000',
        programROI: '8.50%',
        roiTag: 'Competitive',
        currentBenchmark: '5.50%',
        roiSpread: '3.00%',
        benchmarkCode: 'MCLR - 6M',
        penalInterest: '5.00%',
        tenor: '60 Days',
        interestType: 'Monthly Compounding',
        minCPLimit: '₹ 500',
        maxCPLimit: '₹ 50,000',
        offerActivePeriod: '7 Days',
        offerDate: '22-01-2026',
        fldg: '40%',
        fldgNote: 'Offered by Anchor Corporate',
        gracePeriod: '3 Days',
        stopSupply: '7 Days',
        staleInvoice: '5 Days',
        tnc: ['TnC 1 - Minimum invoice value ₹25,000 per transaction', 'TnC 2 - All invoices must be GST compliant'],
      },
    ],
    lastUpdated: '2 hrs ago',
  },
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Offer Submitted': { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    'Lender Rejected': { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    'Under Review': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    'Approved': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  };
  const s = styles[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const OfferDetailsModal = ({ leadId, onClose }) => {
  const details = OFFER_DETAILS[leadId];
  if (!details) return null;

  return (
    <div className="scf-modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', width: 680, maxWidth: '100%', height: '100vh', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', animation: 'slideIn 0.25s ease' }}
        data-testid="offer-details-modal"
      >
        {/* Modal Header */}
        <div style={{ background: '#1a1563', padding: '18px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Offer Details: {details.leadId}</h3>
              <span style={{ background: '#3730a3', color: '#c7d2fe', padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{details.product}</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '2px 10px', borderRadius: 4, fontSize: 11 }}>{details.leadType}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            data-testid="close-offer-modal"
          >
            <X size={14} />
          </button>
        </div>

        {/* Lender Sections */}
        <div style={{ padding: '0 0 80px' }}>
          {details.lenders.map((lender, idx) => (
            <div key={lender.id} style={{ borderBottom: '6px solid #f4f5f9' }}>
              {/* Lender Header */}
              <div style={{ padding: '18px 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: lender.id === 'CBI' ? '#1e3a5f' : lender.id === 'SBI' ? '#1a3c1a' : '#2d1a3c',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0
                  }}>
                    {lender.id}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b' }}>{lender.name}</div>
                    <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>{lender.role}</div>
                  </div>
                </div>
                <StatusBadge status={lender.status} />
              </div>

              <div style={{ padding: '20px 24px' }}>
                {lender.status !== 'Lender Rejected' ? (
                  <>
                    {/* Program Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
                      {[
                        ['Lender Name', lender.name],
                        ['PSB Platform ID', lender.platformId],
                        ['Program Name', lender.programName],
                        ['Program Limit', lender.programLimit],
                        ['Program ROI', <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <strong>{lender.programROI}</strong>
                          {lender.roiTag && <span style={{ background: '#d1fae5', color: '#065f46', padding: '1px 7px', borderRadius: 10, fontSize: 10.5, fontWeight: 600 }}>+ {lender.roiTag}</span>}
                        </span>],
                        ['Current Benchmark', lender.currentBenchmark],
                        ['ROI Spread', lender.roiSpread],
                        ['Benchmark Code', lender.benchmarkCode],
                        ['Penal Interest', lender.penalInterest],
                        ['Tenor', <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={12} style={{ color: '#6b7280' }} />{lender.tenor}</span>],
                        ['Interest Type', lender.interestType],
                        ['Min CP Limit', lender.minCPLimit],
                        ['Max CP Limit', lender.maxCPLimit],
                        ['Offer Active Period', lender.offerActivePeriod],
                        ['Program Offer Date', lender.offerDate],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13.5, color: '#1f2937', fontWeight: 500 }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Operational Settings */}
                    <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '16px', marginBottom: 16 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Operational Settings</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>FLDG</div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: '#1f2937' }}>
                            {lender.fldg}
                            {lender.fldgNote && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{lender.fldgNote}</div>}
                          </div>
                        </div>
                        {[['Grace Period', lender.gracePeriod], ['Stop Supply', lender.stopSupply], ['Stale Invoice', lender.staleInvoice]].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 500, color: '#1f2937' }}>{val}</span>
                              {val !== 'Not Applicable' && <span style={{ background: '#d1fae5', color: '#065f46', padding: '1px 7px', borderRadius: 10, fontSize: 10.5, fontWeight: 600 }}>Applicable</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* T&C */}
                    {lender.tnc?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Lender Terms &amp; Conditions</div>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {lender.tnc.map((t, i) => (
                            <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 5 }}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Rejection Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 16 }}>
                      {[
                        ['Lender Name', lender.name],
                        ['PSB Platform ID', lender.platformId],
                        ['Program Name', lender.programName],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13.5, color: '#1f2937', fontWeight: 500 }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Rejection Remark */}
                    <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 10, marginBottom: 16 }}>
                      <AlertTriangle size={16} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>{lender.rejectionRemark}</p>
                    </div>

                    <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '16px' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Operational Settings</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[['FLDG', 'Not Applicable'], ['Grace Period', 'Not Applicable'], ['Stop Supply', 'Not Applicable'], ['Stale Invoice', 'Not Applicable']].map(([label, val]) => (
                          <div key={label}>
                            <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
                            <div style={{ fontSize: 13, color: '#9ca3af' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Last updated: {details.lastUpdated}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: 12.5, cursor: 'pointer', color: '#374151' }}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#6d28d9', border: 'none', borderRadius: 6, fontSize: 12.5, cursor: 'pointer', color: '#fff' }}>
              <Download size={13} /> Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadCard = ({ lead, onViewDetails }) => {
  const statusColors = {
    'Offer Submitted': { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    'Under Review': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    'Approved': { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  };
  const sc = statusColors[lead.status] || statusColors['Under Review'];
  const productColors = { 'DF': '#dbeafe', 'VF': '#fce7f3' };
  const productTextColors = { 'DF': '#1e40af', 'VF': '#9d174d' };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 12, transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      data-testid={`lead-card-${lead.id}`}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{lead.company}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>#{lead.id}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: productColors[lead.product] || '#f3f4f6', color: productTextColors[lead.product] || '#374151', padding: '2px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
            {lead.product}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 600 }}>
            <TrendingUp size={11} /> Ageing: {lead.ageing} Days
          </span>
          <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: '2px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 600 }}>
            {lead.status}
          </span>
          <button
            onClick={() => onViewDetails(lead.id)}
            style={{ width: 30, height: 30, borderRadius: 6, background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}
            data-testid={`view-details-${lead.id}`}
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Details Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
        <div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Lead Date</div>
          <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={12} style={{ color: '#6b7280' }} />{lead.leadDate}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Type of Lead</div>
          <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{lead.typeOfLead}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Program Name</div>
          <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{lead.programName}</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Lender Name</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {lead.lenders.map(l => (
              <div key={l.short} style={{ fontSize: 12.5, color: '#1e1b4b', fontWeight: 500 }}>{l.name}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ACTIVE_LEADS, OFFER_DETAILS, LeadCard, OfferDetailsModal, StatusBadge };
