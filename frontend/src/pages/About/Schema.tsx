import React from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { getThemeVars } from '../../design-system/theme'
import { typography, spacing } from '../../design-system'
import {
  Card,
  SectionTitle,
  BodyText,
  Alert
} from '../../components/styled/Common.styled'

// Reusable table styles
const getTableStyles = (vars: any) => ({
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: typography.fontSize.sm,
    backgroundColor: vars.background.secondary,
    borderRadius: spacing[2],
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  th: {
    padding: spacing[3],
    textAlign: 'left' as const,
    borderBottom: `2px solid ${vars.border.medium}`,
    backgroundColor: vars.primary[600],
    color: vars.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  td: {
    padding: spacing[3],
    borderBottom: `1px solid ${vars.border.light}`,
    color: vars.text.primary,
  },
  code: {
    backgroundColor: vars.background.tertiary,
    padding: `${spacing[1]} ${spacing[2]}`,
    borderRadius: spacing[1],
    fontFamily: 'monospace',
    fontSize: typography.fontSize.xs,
  },
})

export const Schema: React.FC = () => {
  const { isDark } = useTheme()
  const vars = getThemeVars()
  const tableStyles = getTableStyles(vars)

  return (
    <div>
      {/* Title and Executive Summary */}
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <h1 style={{ 
          ...typography.textStyles.h1, 
          color: vars.primary[600], 
          marginBottom: spacing[3],
          fontSize: typography.fontSize['3xl']
        }}>
          📋 PhilGEPS Schema Evolution Analysis
        </h1>
        <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.lg, marginBottom: spacing[4] }}>
          <strong>Analysis Date:</strong> November 14, 2025<br/>
          <strong>Purpose:</strong> Comprehensive understanding of PhilGEPS data structure changes from 2000-2025
        </BodyText>
        
        <Alert $isDark={isDark} $variant="info" style={{ marginBottom: spacing[4] }}>
          PhilGEPS data has evolved through <strong>5 distinct schemas</strong> over 25 years, 
          reflecting the modernization of the Philippine government procurement system.
        </Alert>

        {/* Quick Reference Table */}
        <div style={{ overflowX: 'auto', marginBottom: spacing[6] }}>
          <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[3], fontSize: typography.fontSize.xl }}>
            Quick Reference
          </SectionTitle>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: typography.fontSize.sm,
            backgroundColor: vars.background.secondary,
            borderRadius: spacing[2],
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: vars.primary[600], color: vars.text.inverse }}>
                <th style={{ padding: spacing[3], textAlign: 'left', borderBottom: `2px solid ${vars.border.medium}` }}>Schema</th>
                <th style={{ padding: spacing[3], textAlign: 'left', borderBottom: `2px solid ${vars.border.medium}` }}>Period</th>
                <th style={{ padding: spacing[3], textAlign: 'left', borderBottom: `2px solid ${vars.border.medium}` }}>Format</th>
                <th style={{ padding: spacing[3], textAlign: 'left', borderBottom: `2px solid ${vars.border.medium}` }}>Columns</th>
                <th style={{ padding: spacing[3], textAlign: 'left', borderBottom: `2px solid ${vars.border.medium}` }}>Key Change</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${vars.border.light}` }}>
                <td style={{ padding: spacing[3], fontWeight: typography.fontWeight.semibold }}>Schema 1</td>
                <td style={{ padding: spacing[3] }}>2000-2015</td>
                <td style={{ padding: spacing[3] }}>XLSX (row 3)</td>
                <td style={{ padding: spacing[3] }}>40</td>
                <td style={{ padding: spacing[3] }}>Original system, uses <code>UOM</code></td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${vars.border.light}` }}>
                <td style={{ padding: spacing[3], fontWeight: typography.fontWeight.semibold }}>Schema 2</td>
                <td style={{ padding: spacing[3] }}>2016-2020</td>
                <td style={{ padding: spacing[3] }}>XLSX (row 3)</td>
                <td style={{ padding: spacing[3] }}>40</td>
                <td style={{ padding: spacing[3] }}>Renamed <code>UOM</code> → <code>Unit of Measurement</code></td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${vars.border.light}` }}>
                <td style={{ padding: spacing[3], fontWeight: typography.fontWeight.semibold }}>Schema 3</td>
                <td style={{ padding: spacing[3] }}>2021-2024</td>
                <td style={{ padding: spacing[3] }}>CSV (row 0)</td>
                <td style={{ padding: spacing[3] }}>43</td>
                <td style={{ padding: spacing[3] }}>Added 3 fields: Created By, Contact Person, Bidder List</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${vars.border.light}` }}>
                <td style={{ padding: spacing[3], fontWeight: typography.fontWeight.semibold }}>Schema 4</td>
                <td style={{ padding: spacing[3] }}>2025</td>
                <td style={{ padding: spacing[3] }}>CSV (row 0)</td>
                <td style={{ padding: spacing[3] }}>46</td>
                <td style={{ padding: spacing[3] }}>Added 12 location fields, removed 9 legacy fields</td>
              </tr>
              <tr>
                <td style={{ padding: spacing[3], fontWeight: typography.fontWeight.semibold }}>Schema 5</td>
                <td style={{ padding: spacing[3] }}>2021-2024-V2</td>
                <td style={{ padding: spacing[3] }}>CSV (row 0)</td>
                <td style={{ padding: spacing[3] }}>46</td>
                <td style={{ padding: spacing[3] }}><strong>Same as Schema 4</strong> - Early PhilGEPS 2.0 implementation</td>
              </tr>
            </tbody>
          </table>
        </div>


        {/* Schema Evolution Timeline */}
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4], fontSize: typography.fontSize.xl }}>
          Schema Evolution Timeline
        </SectionTitle>

        {/* Schema 1 */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[4], backgroundColor: vars.background.tertiary }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[3] }}>
            Schema 1 (2000-2015)
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[3],
            marginBottom: spacing[3]
          }}>
            <div>
              <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>Format</BodyText>
              <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>Excel (.xlsx)</BodyText>
            </div>
            <div>
              <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>Header Row</BodyText>
              <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>Row 3</BodyText>
            </div>
            <div>
              <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>Columns</BodyText>
              <BodyText $isDark={isDark} style={{ fontWeight: typography.fontWeight.semibold }}>40</BodyText>
            </div>
          </div>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
            <strong>Key Characteristics:</strong>
          </BodyText>
          <ul style={{ paddingLeft: spacing[4], color: vars.text.primary }}>
            <li>Column 1: <code>Organization Name</code> (not "Procuring Entity")</li>
            <li>Column 21: <code>UOM</code> (abbreviation for Unit of Measurement)</li>
            <li>Column 37: <code>Contract Efectivity Date</code> (typo persists across versions)</li>
          </ul>
          <BodyText $isDark={isDark} style={{ marginTop: spacing[2] }}>
            <strong>Missing Fields:</strong> Location data for procuring entities and awardees, user tracking, bidder list information.
          </BodyText>
        </Card>

        {/* Schema 2 */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[4], backgroundColor: vars.background.tertiary }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[600], marginBottom: spacing[3] }}>
            Schema 2 (2016-2020)
          </h3>
          <Alert $isDark={isDark} $variant="info" style={{ marginBottom: spacing[3] }}>
            <strong>Single Change:</strong> Column 21 renamed from <code>UOM</code> to <code>Unit of Measurement</code>
          </Alert>
          <BodyText $isDark={isDark}>
            Everything else remains identical to Schema 1. This was likely a data standardization effort 
            to use the full term instead of an abbreviation.
          </BodyText>
        </Card>

        {/* Schema 3 */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[4], backgroundColor: vars.background.tertiary }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.success[600], marginBottom: spacing[3] }}>
            Schema 3 (2021-2024)
          </h3>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[3] }}>
            <strong>Format Change:</strong> XLSX → CSV
          </BodyText>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
            <strong>3 New Columns Added:</strong>
          </BodyText>
          <ul style={{ paddingLeft: spacing[4], color: vars.text.primary, marginBottom: spacing[3] }}>
            <li>Column 26: <code>Created By</code> - User who created the record</li>
            <li>Column 42: <code>Awardee Contact Person</code> - Contact information</li>
            <li>Column 43: <code>List of Bidder's</code> - All entities that bid</li>
          </ul>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
            <strong>Column Renames:</strong>
          </BodyText>
          <ul style={{ paddingLeft: spacing[4], color: vars.text.primary }}>
            <li><code>Organization Name</code> → <code>Procuring Entity</code></li>
            <li><code>Reference ID</code> → <code>Bid Reference No.</code></li>
            <li><code>Publish Date</code> → <code>Published Date</code></li>
            <li><code>Item Desc</code> → <code>Item Description</code></li>
            <li><code>Awardee Corporate Title</code> → <code>Awardee Organization Name</code></li>
          </ul>
        </Card>

        {/* Schema 4 */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[4], backgroundColor: vars.background.tertiary }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.primary[700], marginBottom: spacing[3] }}>
            Schema 4 (2025)
          </h3>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[3] }}>
            <strong>12 New Location Columns:</strong>
          </BodyText>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[4]
          }}>
            <div style={{
              backgroundColor: vars.primary[50],
              padding: spacing[3],
              borderRadius: spacing[2],
              border: `1px solid ${vars.primary[200]}`
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[2] }}>
                Procuring Entity Location (6 fields)
              </h4>
              <ul style={{ fontSize: typography.fontSize.sm, color: vars.primary[600], paddingLeft: spacing[4] }}>
                <li>Region</li>
                <li>Province</li>
                <li>City/Municipality</li>
                <li>Government Branch</li>
                <li>PE Organization Type</li>
                <li>PE Organization Type (Grouped)</li>
              </ul>
            </div>
            
            <div style={{
              backgroundColor: vars.success[50],
              padding: spacing[3],
              borderRadius: spacing[2],
              border: `1px solid ${vars.success[600]}`
            }}>
              <h4 style={{ ...typography.textStyles.h4, color: vars.success[600], marginBottom: spacing[2] }}>
                Awardee Location (6 fields)
              </h4>
              <ul style={{ fontSize: typography.fontSize.sm, color: vars.success[600], paddingLeft: spacing[4] }}>
                <li>Country of Awardee</li>
                <li>Region of Awardee</li>
                <li>Province of Awardee</li>
                <li>City/Municipality of Awardee</li>
                <li>Awardee Size</li>
                <li>Awardee Joint Venture</li>
              </ul>
            </div>
          </div>

          <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
            <strong>9 Legacy Columns Removed:</strong>
          </BodyText>
          <ul style={{ paddingLeft: spacing[4], color: vars.text.primary, marginBottom: spacing[3] }}>
            <li><code>Solicitation No.</code> - Legacy field from old system</li>
            <li><code>Notice Type</code> - Redundant with Classification</li>
            <li><code>PreBid Date</code> - Less commonly used</li>
            <li><code>Created By</code> - Removed after 1 generation</li>
            <li><code>Award Type</code> - Simplified</li>
            <li><code>Reason for Award</code> - Simplified</li>
            <li><code>Contract No</code> - System-generated instead</li>
            <li><code>Awardee Contact Person</code> - Privacy concern</li>
            <li><code>List of Bidder's</code> - Privacy concern</li>
          </ul>

          <Alert $isDark={isDark} $variant="success">
            <strong>✅ Typo Corrected</strong><br />
            The longstanding typo <code>Contract Efectivity Date</code> was corrected to <code>Contract Effectivity Date</code> in Schema 4.
          </Alert>
        </Card>

        {/* Schema 5 */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[6], backgroundColor: vars.background.tertiary }}>
          <h3 style={{ ...typography.textStyles.h3, color: vars.warning[600], marginBottom: spacing[3] }}>
            Schema 5 (2021-2024-V2)
          </h3>
          <Alert $isDark={isDark} $variant="warning" style={{ marginBottom: spacing[3] }}>
            Schema 5 is not a new schema - it's historical 2021-2024 data re-exported using the Schema 4 structure.
          </Alert>
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[2] }}>
            <strong>Likely Scenarios:</strong>
          </BodyText>
          <ul style={{ paddingLeft: spacing[4], color: vars.text.primary }}>
            <li>Data migration when PhilGEPS 2.0 launched</li>
            <li>Location enrichment - retroactively added location data to historical records</li>
            <li>Data quality improvements through re-processing</li>
            <li>Quarterly reporting - changed reporting frequency from yearly to quarterly</li>
          </ul>
        </Card>

        {/* Key Observations */}
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4], fontSize: typography.fontSize.xl }}>
          Key Observations & Insights
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing[4]
        }}>
          <Card $isDark={isDark} style={{ backgroundColor: vars.background.tertiary }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[600], marginBottom: spacing[2] }}>
              📍 Location Data Gap
            </h4>
            <ul style={{ fontSize: typography.fontSize.sm, color: vars.text.primary, paddingLeft: spacing[4] }}>
              <li><strong>2000-2020:</strong> No location data</li>
              <li><strong>2021-2024 (Schema 3):</strong> Still no location data</li>
              <li><strong>2021-2024 (Schema 5):</strong> Full location data (retroactive)</li>
              <li><strong>2025+:</strong> Full location data</li>
            </ul>
          </Card>

          <Card $isDark={isDark} style={{ backgroundColor: vars.background.tertiary }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.warning[600], marginBottom: spacing[2] }}>
              🔒 Privacy Considerations
            </h4>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm }}>
              Schema 3 introduced personal data fields that were removed in Schema 4/5, 
              likely due to privacy regulations (Data Privacy Act of 2012) and GDPR-like compliance.
            </BodyText>
          </Card>

          <Card $isDark={isDark} style={{ backgroundColor: vars.background.tertiary }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.success[600], marginBottom: spacing[2] }}>
              ✨ Status Field Canonicalization
            </h4>
            <ul style={{ fontSize: typography.fontSize.sm, color: vars.text.primary, paddingLeft: spacing[4] }}>
              <li>Old: <code>Notice Status</code> → New: <code>Bid Notice Status</code></li>
              <li>Old: <code>Award Status</code> → New: <code>Award Notice Status</code></li>
            </ul>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm, marginTop: spacing[2] }}>
              The rename makes fields more descriptive and consistent.
            </BodyText>
          </Card>

          <Card $isDark={isDark} style={{ backgroundColor: vars.background.tertiary }}>
            <h4 style={{ ...typography.textStyles.h4, color: vars.primary[500], marginBottom: spacing[2] }}>
              ⚠️ Column Order Is Unreliable
            </h4>
            <BodyText $isDark={isDark} style={{ fontSize: typography.fontSize.sm }}>
              Column positions change dramatically between schemas. 
              <strong> Always map by column NAME, never by position.</strong>
            </BodyText>
          </Card>
        </div>
      </Card>

      {/* Semantic Column Grouping Table */}
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4], fontSize: typography.fontSize.xl }}>
          📊 Complete Semantic Grouping Table
        </SectionTitle>
        <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          This view groups related fields together across schemas, making it easier to see how specific data categories evolved.
        </BodyText>

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>Field Name</th>
                <th style={tableStyles.th}>Schema 1-2<br/>2000-2020</th>
                <th style={tableStyles.th}>Schema 3<br/>2021-2024</th>
                <th style={tableStyles.th}>Schema 4-5<br/>2025/V2</th>
                <th style={tableStyles.th}>Evolution Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>🏛️ PROCURING ENTITY</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Entity name</td><td style={tableStyles.td}><code style={tableStyles.code}>Organization Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procuring Entity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procuring Entity (PE)</code></td><td style={tableStyles.td}>Renamed 2021, clarified 2025</td></tr>
              <tr><td style={tableStyles.td}>Region</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Region</code></td><td style={tableStyles.td}><strong>NEW 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Province</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Province</code></td><td style={tableStyles.td}><strong>NEW 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>City/Municipality</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>City/Municipality</code></td><td style={tableStyles.td}><strong>NEW 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Government branch</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Government Branch</code></td><td style={tableStyles.td}><strong>NEW 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Organization type</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>PE Organization Type</code></td><td style={tableStyles.td}><strong>NEW 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Organization type (grouped)</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>PE Organization Type (Grouped)</code></td><td style={tableStyles.td}><strong>NEW 2025/V2</strong></td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>📋 BID IDENTIFICATION</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Reference number</td><td style={tableStyles.td}><code style={tableStyles.code}>Reference ID</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Bid Reference No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Bid Reference No.</code></td><td style={tableStyles.td}>Renamed 2021</td></tr>
              <tr><td style={tableStyles.td}>Solicitation number</td><td style={tableStyles.td}><code style={tableStyles.code}>Solicitation No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Solicitation No.</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Legacy field dropped 2025</td></tr>
              <tr><td style={tableStyles.td}>Notice title</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Classification</td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Notice type</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Type</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Redundant, dropped 2025</td></tr>
              <tr><td style={tableStyles.td}>Business category</td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>💰 BUDGET & FUNDING</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Funding source</td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Funding instrument</td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Approved budget</td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Trade agreement</td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>📅 BID TIMELINE</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Published date</td><td style={tableStyles.td}><code style={tableStyles.code}>Publish Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date</code></td><td style={tableStyles.td}>Renamed 2021</td></tr>
              <tr><td style={tableStyles.td}>Pre-bid date</td><td style={tableStyles.td}><code style={tableStyles.code}>PreBid Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>PreBid Date</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Less common, dropped 2025</td></tr>
              <tr><td style={tableStyles.td}>Closing date</td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>🛒 PROCUREMENT</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Procurement mode</td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Area of delivery</td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Contract duration</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Calendar type</td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>📦 LINE ITEMS</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Line item number</td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Item name</td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Item description</td><td style={tableStyles.td}><code style={tableStyles.code}>Item Desc</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Description</code></td><td style={tableStyles.td}>Full word 2021</td></tr>
              <tr><td style={tableStyles.td}>Quantity</td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Unit of measure</td><td style={tableStyles.td}><code style={tableStyles.code}>UOM</code> (2000-2015)<br/><code style={tableStyles.code}>Unit of Measurement</code> (2016-2020)</td><td style={tableStyles.td}><code style={tableStyles.code}>UOM</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UOM</code></td><td style={tableStyles.td}><strong>Changed 2016</strong>, reverted 2021</td></tr>
              <tr><td style={tableStyles.td}>Item budget</td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>🏷️ UNSPSC</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>UNSPSC code</td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>UNSPSC description</td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>📊 BID STATUS</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Bid/notice status</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Bid Notice Status</code></td><td style={tableStyles.td}>More descriptive 2025</td></tr>
              <tr><td style={tableStyles.td}>Created by user</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Created By</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Added 2021, privacy concern 2025</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>🏆 AWARD ID</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Award reference</td><td style={tableStyles.td}><code style={tableStyles.code}>Award No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Reference No.</code></td><td style={tableStyles.td}>More descriptive 2025</td></tr>
              <tr><td style={tableStyles.td}>Award title</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Award type</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Type</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Simplified 2025</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>📅 AWARD TIMELINE</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Published date (award)</td><td style={tableStyles.td}><code style={tableStyles.code}>Publish Date(Award)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date(Award)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date(Award)</code></td><td style={tableStyles.td}>Renamed 2021</td></tr>
              <tr><td style={tableStyles.td}>Award date</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Notice to proceed</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Contract effectivity</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Efectivity Date</code> ⚠️</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Efectivity Date</code> ⚠️</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Effectivity Date</code> ✅</td><td style={tableStyles.td}>Typo fixed 2025</td></tr>
              <tr><td style={tableStyles.td}>Contract end date</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}>Stable</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>💵 CONTRACT</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Contract amount</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}>Stable</td></tr>
              <tr><td style={tableStyles.td}>Contract number</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract No</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Auto-generated 2025</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>🎯 AWARD STATUS</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Award status</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Notice Status</code></td><td style={tableStyles.td}>Consistent naming 2025</td></tr>
              <tr><td style={tableStyles.td}>Reason for award</td><td style={tableStyles.td}><code style={tableStyles.code}>Reason for Award</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Reason for Award</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Simplified 2025</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>🏢 AWARDEE INFORMATION</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>Organization name</td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Corporate Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Organization Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Organization Name</code></td><td style={tableStyles.td}>Renamed in 2021</td></tr>
              <tr><td style={tableStyles.td}>Contact person</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Contact Person</code> ⭐</td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Added 2021, removed 2025 (privacy)</td></tr>
              <tr><td style={tableStyles.td}>Country</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Country of Awardee</code></td><td style={tableStyles.td}><strong>NEW in 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Region</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Region of Awardee</code></td><td style={tableStyles.td}><strong>NEW in 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Province</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Province of Awardee</code></td><td style={tableStyles.td}><strong>NEW in 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>City/Municipality</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>City/Municipality of Awardee</code></td><td style={tableStyles.td}><strong>NEW in 2025/V2</strong></td></tr>
              <tr><td style={tableStyles.td}>Awardee size</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Size</code></td><td style={tableStyles.td}><strong>NEW in 2025/V2</strong> (Small/Med/Large)</td></tr>
              <tr><td style={tableStyles.td}>Joint venture</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Joint Venture</code></td><td style={tableStyles.td}><strong>NEW in 2025/V2</strong> (JV partners)</td></tr>
              
              <tr style={{ backgroundColor: vars.primary[50] }}>
                <td style={tableStyles.td} colSpan={5}><strong>👥 COMPETITION</strong></td>
              </tr>
              <tr><td style={tableStyles.td}>List of bidders</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>List of Bidder's</code></td><td style={tableStyles.td}><strong>REMOVED</strong></td><td style={tableStyles.td}>Added 2021, sensitive data 2025</td></tr>
            </tbody>
          </table>
        </div>

        <Alert $isDark={isDark} $variant="info" style={{ marginTop: spacing[4] }}>
          <strong>Key Observations:</strong><br/>
          1. <strong>Location Fields</strong> - Both PE and Awardee expanded from 1 field to 7 fields<br/>
          2. <strong>Core Procurement Fields</strong> - Budget, funding, and procurement mode remain stable<br/>
          3. <strong>Privacy Removals</strong> - User tracking and bidder list fields removed in 2025<br/>
          4. <strong>Legacy Field Removal</strong> - Deprecated fields systematically eliminated<br/>
          5. <strong>Naming Standardization</strong> - Status field names made consistent
        </Alert>
      </Card>

      {/* Side-by-Side Column Comparison */}
      <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
        <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4], fontSize: typography.fontSize.xl }}>
          📑 Side-by-Side Column Comparison
        </SectionTitle>
        <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
          Complete column mapping table showing exact position and name changes across all 5 schemas.
        </BodyText>

        <Alert $isDark={isDark} $variant="warning" style={{ marginBottom: spacing[4] }}>
          <strong>Legend:</strong> ⭐ = New tracking/metadata field | 🌍 = Location/classification field | <strong>Bold</strong> = Major rename or new field
        </Alert>

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={tableStyles.th}>#</th>
                <th style={tableStyles.th}>Schema 1<br/>2000-2015</th>
                <th style={tableStyles.th}>Schema 2<br/>2016-2020</th>
                <th style={tableStyles.th}>Schema 3<br/>2021-2024</th>
                <th style={tableStyles.th}>Schema 4<br/>2025</th>
                <th style={tableStyles.th}>Schema 5<br/>2021-2024-V2</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tableStyles.td}>1</td><td style={tableStyles.td}><code style={tableStyles.code}>Organization Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Organization Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procuring Entity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procuring Entity (PE)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procuring Entity (PE)</code></td></tr>
              <tr><td style={tableStyles.td}>2</td><td style={tableStyles.td}><code style={tableStyles.code}>Reference ID</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Reference ID</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Bid Reference No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Region</code> 🌍</td><td style={tableStyles.td}><code style={tableStyles.code}>Region</code> 🌍</td></tr>
              <tr><td style={tableStyles.td}>3</td><td style={tableStyles.td}><code style={tableStyles.code}>Solicitation No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Solicitation No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Solicitation No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Province</code> 🌍</td><td style={tableStyles.td}><code style={tableStyles.code}>Province</code> 🌍</td></tr>
              <tr><td style={tableStyles.td}>4</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>City/Municipality</code> 🌍</td><td style={tableStyles.td}><code style={tableStyles.code}>City/Municipality</code> 🌍</td></tr>
              <tr><td style={tableStyles.td}>5</td><td style={tableStyles.td}><code style={tableStyles.code}>Publish Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Publish Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Government Branch</code> 🌍</td><td style={tableStyles.td}><code style={tableStyles.code}>Government Branch</code> 🌍</td></tr>
              <tr><td style={tableStyles.td}>6</td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}><code style={tableStyles.code}>PE Organization Type</code> 🌍</td><td style={tableStyles.td}><code style={tableStyles.code}>PE Organization Type</code> 🌍</td></tr>
              <tr><td style={tableStyles.td}>7</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}><code style={tableStyles.code}>PE Organization Type (Grouped)</code> 🌍</td><td style={tableStyles.td}><code style={tableStyles.code}>PE Organization Type (Grouped)</code> 🌍</td></tr>
              <tr><td style={tableStyles.td}>8</td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Bid Reference No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Bid Reference No.</code></td></tr>
              <tr><td style={tableStyles.td}>9</td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Title</code></td></tr>
              <tr><td style={tableStyles.td}>10</td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Classification</code></td></tr>
              <tr><td style={tableStyles.td}>11</td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Procurement Mode</code></td></tr>
              <tr><td style={tableStyles.td}>12</td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Business Category</code></td></tr>
              <tr><td style={tableStyles.td}>13</td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Source</code></td></tr>
              <tr><td style={tableStyles.td}>14</td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Funding Instrument</code></td></tr>
              <tr><td style={tableStyles.td}>15</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}><code style={tableStyles.code}>PreBid Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Trade Agreement</code></td></tr>
              <tr><td style={tableStyles.td}>16</td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Approved Budget of the Contract</code></td></tr>
              <tr><td style={tableStyles.td}>17</td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date</code></td></tr>
              <tr><td style={tableStyles.td}>18</td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td></tr>
              <tr><td style={tableStyles.td}>19</td><td style={tableStyles.td}><code style={tableStyles.code}>Item Desc</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Desc</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Area of Delivery</code></td></tr>
              <tr><td style={tableStyles.td}>20</td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Duration</code></td></tr>
              <tr><td style={tableStyles.td}>21</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>UOM</code></strong></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Unit of Measurement</code></strong></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Calendar Type</code></td></tr>
              <tr><td style={tableStyles.td}>22</td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Line Item No</code></td></tr>
              <tr><td style={tableStyles.td}>23</td><td style={tableStyles.td}><code style={tableStyles.code}>PreBid Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>PreBid Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UOM</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Name</code></td></tr>
              <tr><td style={tableStyles.td}>24</td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Closing Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Description</code></td></tr>
              <tr><td style={tableStyles.td}>25</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Quantity</code></td></tr>
              <tr><td style={tableStyles.td}>26</td><td style={tableStyles.td}><code style={tableStyles.code}>Award No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award No.</code></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Created By</code></strong> ⭐</td><td style={tableStyles.td}><code style={tableStyles.code}>UOM</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UOM</code></td></tr>
              <tr><td style={tableStyles.td}>27</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Item Budget</code></td></tr>
              <tr><td style={tableStyles.td}>28</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Bid Notice Status</code></strong></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Bid Notice Status</code></strong></td></tr>
              <tr><td style={tableStyles.td}>29</td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Type</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Reference No.</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Reference No.</code></td></tr>
              <tr><td style={tableStyles.td}>30</td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Title</code></td></tr>
              <tr><td style={tableStyles.td}>31</td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Corporate Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Corporate Title</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Code</code></td></tr>
              <tr><td style={tableStyles.td}>32</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date(Award)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td><td style={tableStyles.td}><code style={tableStyles.code}>UNSPSC Description</code></td></tr>
              <tr><td style={tableStyles.td}>33</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date(Award)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Published Date(Award)</code></td></tr>
              <tr><td style={tableStyles.td}>34</td><td style={tableStyles.td}><code style={tableStyles.code}>Publish Date(Award)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Publish Date(Award)</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td></tr>
              <tr><td style={tableStyles.td}>35</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract No</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td></tr>
              <tr><td style={tableStyles.td}>36</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Amount</code></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Award Notice Status</code></strong></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Award Notice Status</code></strong></td></tr>
              <tr><td style={tableStyles.td}>37</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Efectivity Date</code> ⚠️</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Efectivity Date</code> ⚠️</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Efectivity Date</code> ⚠️</td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Notice to Proceed Date</code></td></tr>
              <tr><td style={tableStyles.td}>38</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Effectivity Date</code> ✅</td><td style={tableStyles.td}><code style={tableStyles.code}>Contract Effectivity Date</code> ✅</td></tr>
              <tr><td style={tableStyles.td}>39</td><td style={tableStyles.td}><code style={tableStyles.code}>Reason for Award</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Reason for Award</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Contract End Date</code></td></tr>
              <tr><td style={tableStyles.td}>40</td><td style={tableStyles.td}><code style={tableStyles.code}>Award Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Award Status</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Reason for Award</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Organization Name</code></td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Organization Name</code></td></tr>
              <tr><td style={tableStyles.td}>41</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><code style={tableStyles.code}>Awardee Organization Name</code></td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Country of Awardee</code></strong> 🌍</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Country of Awardee</code></strong> 🌍</td></tr>
              <tr><td style={tableStyles.td}>42</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Awardee Contact Person</code></strong> ⭐</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Region of Awardee</code></strong> 🌍</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Region of Awardee</code></strong> 🌍</td></tr>
              <tr><td style={tableStyles.td}>43</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>List of Bidder's</code></strong> ⭐</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Province of Awardee</code></strong> 🌍</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Province of Awardee</code></strong> 🌍</td></tr>
              <tr><td style={tableStyles.td}>44</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>City/Municipality of Awardee</code></strong> 🌍</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>City/Municipality of Awardee</code></strong> 🌍</td></tr>
              <tr><td style={tableStyles.td}>45</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Awardee Size</code></strong> 🌍</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Awardee Size</code></strong> 🌍</td></tr>
              <tr><td style={tableStyles.td}>46</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}>—</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Awardee Joint Venture</code></strong> 🌍</td><td style={tableStyles.td}><strong><code style={tableStyles.code}>Awardee Joint Venture</code></strong> 🌍</td></tr>
            </tbody>
          </table>
        </div>

        <BodyText $isDark={isDark} style={{ marginTop: spacing[4], fontSize: typography.fontSize.sm, fontStyle: 'italic' }}>
          Note: Complete 46-row mapping table showing all column positions and name changes across all 5 schemas.
        </BodyText>
      </Card>
    </div>
  )
}
