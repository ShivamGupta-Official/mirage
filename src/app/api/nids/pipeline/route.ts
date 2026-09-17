import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pipelineData = {
    isolation: {
      status: 'VERIFIED_ISOLATED',
      subnet: '10.99.1.0/24',
      dns_sinkhole: '10.99.1.254',
      mode: 'IN_MEMORY_PCAP_SERIALIZATION',
      physical_adapters_egress_blocked: ['wlp0s20f3', 'enp2s0'],
      socket_safety: 'ZERO_EGRESS_ENFORCED',
    },
    dataset_summary: {
      total_flows: 5834,
      total_features: 77,
      sources_count: 8,
      sources: [
        { id: 'synthetic_lab', name: 'Synthetic Lab Testbed', type: 'Lab-Generated PCAP', flows: 5174, role: 'Training Base' },
        { id: 'cicids2017', name: 'CICIDS2017 Benchmark', type: 'CICFlowMeter CSV', flows: 200, role: 'Training Base' },
        { id: 'trustlab', name: 'TRUSTLab Dataset', type: 'CICFlowMeter CSV', flows: 120, role: 'Held-out Test (C2/Slowloris)' },
        { id: 'cira_doh', name: 'CIRA-CIC-DoHBrw-2020', type: 'Precomputed CSV (dns2tcp/Iodine)', flows: 80, role: 'Held-out Test (DNS Tunnel)' },
        { id: 'palau_dns', name: 'Palau DNS Tunneling', type: 'Re-extracted PCAP', flows: 60, role: 'Training Base' },
        { id: 'unsw_nb15', name: 'UNSW-NB15 (IXIA)', type: 'Semantic Schema Aligned', flows: 80, role: 'Held-out Test (Flood/C2)' },
        { id: 'lanl_enterprise', name: 'LANL Enterprise Multi-Source', type: 'Real-world Enterprise Netflow', flows: 60, role: 'Held-out Test (Real Benign)' },
        { id: 'ugr16_backbone', name: "UGR'16 ISP Backbone", type: 'Real-world ISP Netflow', flows: 60, role: 'Held-out Test (Real Benign)' },
      ],
      class_matrix: [
        { class: 'benign', synthetic_lab: 142, cicids2017: 50, trustlab: 40, cira_doh: 30, palau_dns: 20, unsw_nb15: 30, lanl_enterprise: 60, ugr16_backbone: 60, total: 432 },
        { class: 'c2_beacon', synthetic_lab: 55, cicids2017: 0, trustlab: 40, cira_doh: 0, palau_dns: 0, unsw_nb15: 20, lanl_enterprise: 0, ugr16_backbone: 0, total: 115 },
        { class: 'dga', synthetic_lab: 3, cicids2017: 0, trustlab: 0, cira_doh: 0, palau_dns: 0, unsw_nb15: 0, lanl_enterprise: 0, ugr16_backbone: 0, total: 3 },
        { class: 'dns_tunnel', synthetic_lab: 3, cicids2017: 0, trustlab: 0, cira_doh: 50, palau_dns: 40, unsw_nb15: 0, lanl_enterprise: 0, ugr16_backbone: 0, total: 93 },
        { class: 'slowloris', synthetic_lab: 95, cicids2017: 50, trustlab: 40, cira_doh: 0, palau_dns: 0, unsw_nb15: 0, lanl_enterprise: 0, ugr16_backbone: 0, total: 185 },
        { class: 'syn_flood', synthetic_lab: 3600, cicids2017: 50, trustlab: 0, cira_doh: 0, palau_dns: 0, unsw_nb15: 30, lanl_enterprise: 0, ugr16_backbone: 0, total: 3680 },
        { class: 'udp_flood', synthetic_lab: 1276, cicids2017: 50, trustlab: 0, cira_doh: 0, palau_dns: 0, unsw_nb15: 0, lanl_enterprise: 0, ugr16_backbone: 0, total: 1326 },
      ],
      imbalance_audit: {
        majority_class: 'syn_flood',
        majority_count: 3680,
        threshold_5pct: 184,
        flagged_minority_classes: ['c2_beacon (115)', 'dga (3)', 'dns_tunnel (93)', 'slowloris (185 border)'],
        strategy_applied: 'RandomOverSampler / SMOTE applied strictly to training split',
        balanced_train_size: 9536,
      },
    },
    generalization_gap: {
      split_train_sources: ['synthetic_lab', 'cicids2017', 'palau_dns'],
      split_held_out_sources: ['cira_doh', 'trustlab', 'unsw_nb15', 'lanl_enterprise', 'ugr16_backbone'],
      macro_random_f1: 0.719,
      macro_cross_source_f1: 0.080,
      macro_delta_gap: 0.639,
      classes: [
        { name: 'benign', random_f1: 0.936, cross_f1: 0.400, delta: 0.536, gap: true, reason: 'ISP/Enterprise backbone flows differ from lab iperf3/TRex patterns' },
        { name: 'c2_beacon', random_f1: 0.490, cross_f1: 0.000, delta: 0.490, gap: true, reason: 'TRUSTLab/UNSW botnets have different timing structures than synthetic lab generator' },
        { name: 'dga', random_f1: 0.000, cross_f1: 0.000, delta: 0.000, gap: false, reason: 'Underrepresented in held-out public source (domain level feed only)' },
        { name: 'dns_tunnel', random_f1: 1.000, cross_f1: 0.000, delta: 1.000, gap: true, reason: 'CIRA DoH uses DNS-over-HTTPS payloads while lab was raw DNS' },
        { name: 'slowloris', random_f1: 0.658, cross_f1: 0.000, delta: 0.658, gap: true, reason: 'TRUSTLab Slowloris held sockets with different header interval distribution' },
        { name: 'syn_flood', random_f1: 0.986, cross_f1: 0.000, delta: 0.986, gap: true, reason: 'UNSW-NB15 uses IXIA generator with unique TCP window sizes and MSS' },
        { name: 'udp_flood', random_f1: 0.962, cross_f1: 0.000, delta: 0.962, gap: true, reason: 'No separate held-out source for UDP flood in current held-out slice' },
      ],
      insight: 'A large positive Delta F1 (+0.639) exposes dataset-specific collection quirks and toolchain artifacts (e.g. IXIA vs Scapy vs physical hardware). Cross-source evaluation is essential to prevent false confidence in production NIDS.',
    },
    models: [
      {
        id: 'RandomForest_NIDS',
        name: 'Random Forest Ensemble',
        type: 'Supervised Random Forest (100 Trees)',
        file: 'models/RandomForest_NIDS.joblib',
        size_mb: 1.88,
        features: 77,
        random_split_f1: 0.907,
        cross_source_f1: 0.125,
        status: 'DEPLOYED_IN_ENCLAVE',
      },
      {
        id: 'XGBoost_NIDS',
        name: 'XGBoost Gradient Booster',
        type: 'Gradient Boosted Decision Trees',
        file: 'models/XGBoost_NIDS.joblib',
        size_mb: 0.83,
        features: 77,
        random_split_f1: 0.895,
        cross_source_f1: 0.181,
        status: 'DEPLOYED_IN_ENCLAVE',
      },
    ],
    feature_categories: [
      { name: 'Flow Timing & Rates', count: 18, examples: ['Flow Duration', 'Flow IAT Mean', 'Flow IAT Std', 'Flow Bytes/s', 'Flow Packets/s'] },
      { name: 'Packet Length Statistics', count: 16, examples: ['Total Length of Fwd Packets', 'Fwd Packet Length Max', 'Bwd Packet Length Mean', 'Packet Length Std'] },
      { name: 'TCP Flag Distributions', count: 12, examples: ['FIN Flag Count', 'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count', 'ACK Flag Count'] },
      { name: 'Window & Bulk Transmission', count: 14, examples: ['Init_Win_bytes_forward', 'Init_Win_bytes_backward', 'Fwd Avg Bytes/Bulk', 'Fwd Avg Bulk Rate'] },
      { name: 'Subflow & Activity Metrics', count: 17, examples: ['Subflow Fwd Packets', 'Subflow Fwd Bytes', 'Active Mean', 'Idle Mean', 'min_seg_size_forward'] },
    ],
  };

  return NextResponse.json(pipelineData);
}
