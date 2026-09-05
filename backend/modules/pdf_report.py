# -*- coding: utf-8 -*-
"""Modulo para generacion de informes PDF - EnergyGrid v3.0"""
import os, math
from datetime import datetime
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

C_NAVY    = colors.HexColor('#0a2e5d')
C_BLUE    = colors.HexColor('#1e3a8a')
C_CYAN    = colors.HexColor('#0891b2')
C_GREEN   = colors.HexColor('#d1fae5')
C_RED     = colors.HexColor('#fee2e2')
C_GRAY_LT = colors.HexColor('#f5f5f5')
C_GRAY_MD = colors.HexColor('#e0e0e0')
C_GRAY_TX = colors.HexColor('#444444')
C_WHITE   = colors.white
C_GREEN_TXT = colors.HexColor('#15803d')
C_RED_TXT   = colors.HexColor('#b91c1c')


class PDFReportGenerator:
    PAGE_W    = letter[0]
    CONTENT_W = letter[0] - 3.0*cm

    def __init__(self, filename):
        self.filename = filename
        self.doc = SimpleDocTemplate(
            filename, pagesize=letter,
            topMargin=2.2*cm, bottomMargin=2.0*cm,
            leftMargin=1.5*cm, rightMargin=1.5*cm
        )
        self.story = []
        self.styles = self._setup_styles()
        self.date_str = datetime.now().strftime('%d/%m/%Y %H:%M')

    def _setup_styles(self):
        s = getSampleStyleSheet()
        s.add(ParagraphStyle('CoverTitle',
            parent=s['Heading1'], fontSize=34, textColor=C_BLUE,
            alignment=TA_CENTER, spaceAfter=8, spaceBefore=50,
            fontName='Helvetica-Bold'))
        s.add(ParagraphStyle('CoverSub',
            parent=s['Normal'], fontSize=13, textColor=C_CYAN,
            alignment=TA_CENTER, spaceAfter=4))
        s.add(ParagraphStyle('SectionTitle',
            parent=s['Heading2'], fontSize=13, textColor=C_NAVY,
            spaceAfter=6, spaceBefore=4, fontName='Helvetica-Bold', leading=18))
        s.add(ParagraphStyle('Body',
            parent=s['Normal'], fontSize=9, leading=13, textColor=C_GRAY_TX))
        s.add(ParagraphStyle('Small',
            parent=s['Normal'], fontSize=8, leading=11,
            textColor=colors.HexColor('#666666')))
        s.add(ParagraphStyle('WarnText',
            parent=s['Normal'], fontSize=10,
            textColor=C_RED_TXT, fontName='Helvetica-Bold'))
        return s

    def _header_footer(self, canvas, doc):
        canvas.saveState()
        w = doc.pagesize[0]
        h = doc.pagesize[1]
        canvas.setFillColor(C_NAVY)
        canvas.rect(0, h - 1.5*cm, w, 1.5*cm, stroke=0, fill=1)
        canvas.setFillColor(C_WHITE)
        canvas.setFont('Helvetica-Bold', 9)
        canvas.drawString(1.5*cm, h - 0.95*cm, "ENERGY GRID - Informe Tecnico de Malla a Tierra")
        canvas.setFont('Helvetica', 9)
        canvas.drawRightString(w - 1.5*cm, h - 0.95*cm, self.date_str)
        canvas.setFillColor(C_NAVY)
        canvas.rect(0, 0, w, 1.2*cm, stroke=0, fill=1)
        canvas.setFillColor(C_WHITE)
        canvas.setFont('Helvetica-Bold', 8)
        canvas.drawString(1.5*cm, 0.4*cm, "Claudio Gonzalez Arancibia - Ing. Electricidad")
        canvas.setFont('Helvetica', 8)
        canvas.drawRightString(w - 1.5*cm, 0.4*cm, f"Pagina {doc.page}")
        canvas.restoreState()

    def _h(self, h_cm):
        self.story.append(Spacer(1, h_cm*cm))

    def _hr(self):
        self.story.append(HRFlowable(width='100%', thickness=0.5, color=C_GRAY_MD, spaceAfter=4))

    def _section_header(self, number, title):
        data = [[Paragraph(f"<b>{number}. {title.upper()}</b>",
            ParagraphStyle('SH', parent=self.styles['SectionTitle'],
                textColor=C_WHITE, fontSize=11, spaceAfter=0, spaceBefore=0))]]
        t = Table(data, colWidths=[self.CONTENT_W])
        t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), C_NAVY),
            ('TOPPADDING',    (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ]))
        self.story += [Spacer(1, 0.25*cm), t, Spacer(1, 0.15*cm)]

    def _sub_header(self, title):
        data = [[Paragraph(f"<b>{title}</b>",
            ParagraphStyle('SSH', parent=self.styles['Body'],
                textColor=C_BLUE, fontName='Helvetica-Bold', spaceAfter=0, spaceBefore=0))]]
        t = Table(data, colWidths=[self.CONTENT_W])
        t.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), colors.HexColor('#dbeafe')),
            ('TOPPADDING',    (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ]))
        self.story += [t, Spacer(1, 0.1*cm)]

    def _param_table(self, rows, widths=None):
        if not rows: return None
        if widths is None:
            n = len(rows[0]); col = self.CONTENT_W / n
            widths = [col]*n
        t = Table(rows, colWidths=widths, repeatRows=1)
        style = [
            ('BACKGROUND',    (0,0), (-1,0),  C_BLUE),
            ('TEXTCOLOR',     (0,0), (-1,0),  C_WHITE),
            ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
            ('FONTSIZE',      (0,0), (-1,0),  9),
            ('ALIGN',         (0,0), (-1,0),  'CENTER'),
            ('TOPPADDING',    (0,0), (-1,0),  6),
            ('BOTTOMPADDING', (0,0), (-1,0),  6),
            ('FONTNAME',      (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE',      (0,1), (-1,-1), 9),
            ('ALIGN',         (1,1), (-1,-1), 'CENTER'),
            ('ALIGN',         (0,1), (0,-1),  'LEFT'),
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,1), (-1,-1), 4),
            ('BOTTOMPADDING', (0,1), (-1,-1), 4),
            ('LEFTPADDING',   (0,0), (-1,-1), 6),
            ('GRID',          (0,0), (-1,-1), 0.4, C_GRAY_MD),
        ]
        for i in range(1, len(rows)):
            style.append(('BACKGROUND', (0,i), (-1,i), C_GRAY_LT if i%2==0 else C_WHITE))
        t.setStyle(TableStyle(style)); return t

    def _verdict_table(self, rows, widths=None):
        if not rows: return None
        if widths is None:
            n = len(rows[0]); col = self.CONTENT_W / n
            widths = [col]*n
        t = Table(rows, colWidths=widths, repeatRows=1)
        style = [
            ('BACKGROUND',    (0,0), (-1,0),  C_BLUE),
            ('TEXTCOLOR',     (0,0), (-1,0),  C_WHITE),
            ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
            ('FONTSIZE',      (0,0), (-1,0),  9),
            ('ALIGN',         (0,0), (-1,0),  'CENTER'),
            ('TOPPADDING',    (0,0), (-1,0),  6),
            ('BOTTOMPADDING', (0,0), (-1,0),  6),
            ('FONTNAME',      (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE',      (0,1), (-1,-1), 9),
            ('ALIGN',         (1,1), (-1,-1), 'CENTER'),
            ('ALIGN',         (0,1), (0,-1),  'LEFT'),
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,1), (-1,-1), 4),
            ('BOTTOMPADDING', (0,1), (-1,-1), 4),
            ('LEFTPADDING',   (0,0), (-1,-1), 6),
            ('GRID',          (0,0), (-1,-1), 0.4, C_GRAY_MD),
        ]
        for i, row in enumerate(rows):
            if i == 0: continue
            style.append(('BACKGROUND', (0,i), (-1,i), C_GRAY_LT if i%2==0 else C_WHITE))
            for j, cell in enumerate(row):
                cs = str(cell)
                if 'OK' in cs:
                    style += [('BACKGROUND',(j,i),(j,i),C_GREEN),('TEXTCOLOR',(j,i),(j,i),C_GREEN_TXT),('FONTNAME',(j,i),(j,i),'Helvetica-Bold')]
                elif 'NO CUMPLE' in cs or 'REVISAR' in cs:
                    style += [('BACKGROUND',(j,i),(j,i),C_RED),('TEXTCOLOR',(j,i),(j,i),C_RED_TXT),('FONTNAME',(j,i),(j,i),'Helvetica-Bold')]
        t.setStyle(TableStyle(style)); return t

    def _verdict_box(self, text, is_ok):
        bg = C_GREEN if is_ok else C_RED
        tc = C_GREEN_TXT if is_ok else C_RED_TXT
        sym = "V" if is_ok else "X"
        data = [[Paragraph(f"<b>{sym}  {text}</b>",
            ParagraphStyle('VB', parent=self.styles['Body'],
                textColor=tc, fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER))]]
        t = Table(data, colWidths=[self.CONTENT_W])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),bg),('BOX',(0,0),(-1,-1),1.2,tc),
            ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
        return t

    def _keep(self, *elements):
        self.story.append(KeepTogether([e for e in elements if e is not None]))

    def generate(self):
        self.doc.build(self.story, onFirstPage=self._header_footer, onLaterPages=self._header_footer)
        return True


def generar_informe_pdf(filename: str, session_data: Dict[str, Any]) -> bool:
    try:
        r = PDFReportGenerator(filename)
        S = r.styles

        project_name = session_data.get('nombre_proyecto') or session_data.get('project_name', 'Proyecto de Malla a Tierra')
        responsable  = session_data.get('responsable_proyecto') or session_data.get('responsable', 'Claudio Gonzalez Arancibia')
        malla      = session_data.get('tab1_results', {}) or {}
        trafo      = session_data.get('tab2_impedancia_results', {}) or {}
        ecm        = session_data.get('tab2_ecm_results', {}) or {}
        falla      = session_data.get('tab3_falla_calculada', {}) or {}
        caida      = session_data.get('tab3_caida_tension', {}) or {}
        admisibles = session_data.get('tab4_admisibles', {}) or {}
        reales     = session_data.get('tab4_reales', {}) or {}
        seccion    = session_data.get('tab5_results', {}) or {}
        capacitores= session_data.get('tab7_results', {}) or {}
        I_falla    = session_data.get('I_falla_final', 0) or 0

        ok_malla    = malla.get('R_referencia', 999) <= 20 if malla else False
        ok_paso     = reales.get('Vp_real', 9999) < admisibles.get('Vp50', 1) if reales and admisibles else False
        ok_contacto = reales.get('Vc_real', 9999) < admisibles.get('Vc50', 1) if reales and admisibles else False
        ok_seccion  = seccion.get('S_final', 0) >= 25 if seccion else False

        # == PORTADA ==
        r.story.append(Spacer(1, 1.5*inch))
        r.story.append(Paragraph("ENERGY GRID", S['CoverTitle']))
        r.story.append(Paragraph("Sistema de Calculo de Mallas a Tierra", S['CoverSub']))
        r.story.append(Paragraph("Informe Tecnico - RPTD N06 / IEEE Std 80", S['CoverSub']))
        r._h(0.8)
        port_t = Table([
            ["Proyecto",    project_name],
            ["Responsable", responsable],
            ["Fecha",       datetime.now().strftime('%d/%m/%Y')],
            ["Documento",   f"EG-{datetime.now().strftime('%Y%m%d-%H%M')}"],
            ["Normativas",  "RPTD N06 (Chile) - IEEE Std 80"],
            ["Software",    "Energy Grid v3.0"],
        ], colWidths=[2.5*inch, 4*inch])
        port_t.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(0,-1),C_BLUE),('TEXTCOLOR',(0,0),(0,-1),C_WHITE),
            ('ALIGN',(0,0),(0,-1),'RIGHT'),('FONTNAME',(0,0),(0,-1),'Helvetica-Bold'),
            ('BACKGROUND',(1,0),(1,-1),C_GRAY_LT),('ALIGN',(1,0),(1,-1),'LEFT'),
            ('FONTNAME',(1,0),(1,-1),'Helvetica'),('GRID',(0,0),(-1,-1),0.4,C_GRAY_MD),
            ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),10),
        ]))
        r.story.append(KeepTogether([port_t]))
        r._h(0.6)
        r.story.append(Paragraph(
            "Este informe presenta los resultados de los calculos para el diseno y verificacion "
            "de la malla a tierra, conforme a RPTD N06 (Chile) e IEEE Std 80.", S['Body']))
        r.story.append(PageBreak())

        # == 1. RESISTENCIA DE MALLA ==
        r._section_header("1", "RESISTENCIA DE MALLA A TIERRA")
        if malla:
            R_sch = malla.get('R_referencia', 0)
            r._sub_header("1.1 Parametros Geometricos y de Suelo")
            t1 = r._param_table([
                ["Parametro","Valor","Unidad"],
                ["Resistividad equivalente (rho_eq)",f"{malla.get('rho_eq',0):.2f}","Ohm·m"],
                ["Area de la malla (S)",f"{malla.get('S_area',0):.2f}","m2"],
                ["Largo total conductores (L)",f"{malla.get('L_total',0):.2f}","m"],
                ["Profundidad de entierro (h)",f"{malla.get('h_prof',0):.2f}","m"],
                ["Radio del conductor (r)",f"{malla.get('r_conductor_m',0)*100:.3f}","cm"],
                ["Conductores dir. A (nA)",f"{malla.get('n_conductores_A',0)}","-"],
                ["Conductores dir. B (nB)",f"{malla.get('n_conductores_B',0)}","-"],
            ], [3.2*inch, 1.6*inch, 1.0*inch])
            r._sub_header("1.2 Resultados - Resistencia de Malla")
            t2 = r._param_table([
                ["Metodo","Resistencia (Ohm)","Referencia"],
                ["Schwarz (referencia)",f"{R_sch:.4f}","RPTD N06 - Principal"],
                ["Sverak",f"{malla.get('R_sverak',0):.4f}","IEEE 80 sec.16"],
                ["Laurent",f"{malla.get('R_laurent',0):.4f}","IEEE 80 sec.16"],
                ["Limite normativo","<= 20.0","RPTD N06 sec.6.3"],
            ], [2.8*inch, 2.0*inch, 1.8*inch])
            vd = r._verdict_box(f"Resistencia = {R_sch:.4f} Ohm  {'<=' if ok_malla else '>'} 20 Ohm  -  {'CUMPLE' if ok_malla else 'NO CUMPLE'}", ok_malla)
            r._keep(t1, Spacer(1,0.1*cm), t2, Spacer(1,0.1*cm), vd)
        else:
            r.story.append(Paragraph("No se encontraron datos de la malla.", S['WarnText']))

        # == 2. TRANSFORMADOR ==
        r.story.append(PageBreak())
        r._section_header("2","TRANSFORMADOR Y PROTECCIONES MT")
        if trafo:
            pot = session_data.get('tab2_potencia_results', {}) or {}
            r._sub_header("2.1 Datos del Transformador")
            t1 = r._param_table([
                ["Parametro","Valor","Unidad"],
                ["Potencia nominal",f"{trafo.get('S_kva',0):.0f}","kVA"],
                ["Tension BT (V_LL)",f"{trafo.get('V_ll',380):.0f}","V"],
                ["Tension cortocircuito ucc",f"{trafo.get('ucc_pct',0):.2f}","%"],
                ["Resistencia Rt",f"{trafo.get('Rt_mOhm',0):.4f}","mOhm"],
                ["Reactancia Xt",f"{trafo.get('Xt_mOhm',0):.3f}","mOhm"],
                ["Impedancia Zt",f"{trafo.get('Z_final_mOhm',0):.3f}","mOhm"],
                ["I nominal BT",f"{pot.get('I_nom_BT',0):.1f}","A"],
                ["I nominal MT",f"{pot.get('I_nom_MT',0):.1f}","A"],
            ], [3.2*inch, 1.6*inch, 1.0*inch])
            Icc3 = falla.get('I_cc3_sym', 0)
            r._sub_header("2.2 Corriente de Cortocircuito en BT")
            t2 = r._param_table([
                ["Tipo de Falla","I (A)","I (kA)"],
                ["Trifasica simetrica (Icc3)",f"{Icc3:.1f}",f"{Icc3/1000:.3f}"],
                ["Monofasica (Icc1 - para malla)",f"{I_falla:.1f}",f"{I_falla/1000:.3f}"],
            ], [3.0*inch, 1.5*inch, 1.5*inch])
            r._keep(t1, Spacer(1,0.15*cm), t2)
        else:
            r.story.append(Paragraph("No se encontraron datos del transformador.", S['WarnText']))
        if ecm:
            r._h(0.15)
            r._sub_header("2.3 ECM y Fusible MT")
            t3 = r._param_table([
                ["Parametro","Valor"],
                ["Compania distribuidora",ecm.get('compania','N/A')],
                ["Tension MT",ecm.get('tension_kv','N/A')],
                ["I nominal primaria",f"{ecm.get('I_nom_prim',0):.2f} A"],
                ["Relacion TC",ecm.get('tc_ratio','N/A')],
                ["Tipo fusible MT",ecm.get('fuse_type','N/A')],
                ["Poder de corte",f"{ecm.get('fuse_I1',0)} kA"],
                ["Corriente inrush",f"{ecm.get('I_inrush',0):.2f} A"],
                ["Verificacion icc",ecm.get('veredicto_icc','N/A')],
                ["Verificacion inrush",ecm.get('veredicto_inrush','N/A')],
            ], [3.2*inch, 3.2*inch])
            r.story.append(t3)

        # == 3. ALIMENTADOR ==
        r.story.append(PageBreak())
        r._section_header("3","ALIMENTADOR EN BT Y CORRIENTES DE FALLA")
        if falla or I_falla > 0:
            Icc3s = falla.get('I_cc3_sym', 0)
            Icc3a = falla.get('I_cc3_asym', 0)
            r._sub_header("3.1 Corrientes de Cortocircuito")
            t1 = r._param_table([
                ["Tipo de Falla","Valor (A)","Valor (kA)","Uso"],
                ["Monofasica Icc1 (malla)",f"{I_falla:.1f}",f"{I_falla/1000:.3f}","Dimensionamiento conductor"],
                ["Trifasica simetrica Icc3",f"{Icc3s:.1f}",f"{Icc3s/1000:.3f}","Protecciones BT"],
                ["Trifasica asimetrica Icc3_asym",f"{Icc3a:.1f}",f"{Icc3a/1000:.3f}","Verificacion fusibles"],
            ], [2.5*inch, 1.3*inch, 1.2*inch, 1.6*inch])
            r.story.append(t1)
        else:
            r.story.append(Paragraph("No se encontraron datos de corrientes de falla.", S['WarnText']))
        if caida:
            r._h(0.15)
            caida_pct = caida.get('caida_pct', 0)
            r._sub_header("3.2 Caida de Tension en Alimentador")
            t2 = r._param_table([
                ["Parametro","Valor","Unidad"],
                ["Longitud",f"{caida.get('longitud',0):.1f}","m"],
                ["Corriente nominal",f"{caida.get('corriente',0):.1f}","A"],
                ["Seccion conductor",f"{caida.get('seccion',0)}","mm2"],
                ["Caida (dVl)",f"{caida.get('dVl',0):.2f}","V"],
                ["Caida porcentual",f"{caida_pct:.2f}","%"],
                ["Limite (<= 3%)",   "3.0","%"],
            ], [3.0*inch, 1.5*inch, 1.0*inch])
            ok_c = caida_pct <= 3.0
            vd = r._verdict_box(f"Caida de Tension = {caida_pct:.2f}%  {'<=' if ok_c else '>'} 3.0%  -  {'CUMPLE' if ok_c else 'NO CUMPLE'}", ok_c)
            r._keep(t2, Spacer(1,0.1*cm), vd)

        # == 4. TENSIONES ==
        r.story.append(PageBreak())
        r._section_header("4","TENSIONES DE PASO Y CONTACTO (IEEE 80)")
        if admisibles:
            r._sub_header("4.1 Parametros de Capa Superficial y Tensiones Admisibles")
            t1 = r._param_table([
                ["Parametro","Valor","Unidad"],
                ["Resistividad suelo (rho_eq)",f"{admisibles.get('rho_s',0):.2f}","Ohm·m"],
                ["Espesor capa superficial (hs)",f"{admisibles.get('hs',0):.3f}","m"],
                ["Tiempo de despeje (ts)",f"{admisibles.get('ts',0):.2f}","s"],
                ["Factor reduccion (Cs)",f"{admisibles.get('Cs',1.0):.4f}","-"],
                ["V. Paso admisible (Vp50)",f"{admisibles.get('Vp50',0):.2f}","V"],
                ["V. Contacto admisible (Vc50)",f"{admisibles.get('Vc50',0):.2f}","V"],
            ], [3.2*inch, 1.6*inch, 1.0*inch])
            r.story.append(t1)
        if reales and admisibles:
            r._h(0.15)
            r._sub_header("4.2 Constantes Geometricas de la Malla")
            t2 = r._param_table([
                ["Constante","Valor","Descripcion"],
                ["Km",f"{reales.get('K_m',0):.4f}","Factor geometrico tension de malla"],
                ["Ks",f"{reales.get('K_s',0):.4f}","Factor geometrico tension de paso"],
                ["Ki",f"{reales.get('K_i',0):.4f}","Factor de irregularidad"],
                ["Lm",f"{reales.get('L_m',0):.2f} m","Longitud efectiva tension de malla"],
                ["Ls",f"{reales.get('L_s',0):.2f} m","Longitud efectiva tension de paso"],
            ], [1.5*inch, 1.5*inch, 3.6*inch])
            r._sub_header("4.3 Tensiones Reales vs Admisibles")
            Vp_r = reales.get('Vp_real',0); Vc_r = reales.get('Vc_real',0)
            Vp50 = admisibles.get('Vp50',1); Vc50 = admisibles.get('Vc50',1)
            mp = (Vp50-Vp_r)/Vp50*100 if Vp50>0 else 0
            mc = (Vc50-Vc_r)/Vc50*100 if Vc50>0 else 0
            t3 = r._verdict_table([
                ["Verificacion","Admisible (V)","Real (V)","Margen (%)","Estado"],
                ["Tension de Paso",f"{Vp50:.2f}",f"{Vp_r:.2f}",f"{mp:.1f}","OK" if ok_paso else "NO CUMPLE"],
                ["Tension de Contacto",f"{Vc50:.2f}",f"{Vc_r:.2f}",f"{mc:.1f}","OK" if ok_contacto else "NO CUMPLE"],
            ], [2.2*inch, 1.3*inch, 1.3*inch, 1.3*inch, 1.5*inch])
            ok_t = ok_paso and ok_contacto
            vd = r._verdict_box("Tensiones de Paso y Contacto - "+("CUMPLEN normativa IEEE 80" if ok_t else "UNA O MAS NO CUMPLEN"), ok_t)
            r._keep(t2, Spacer(1,0.15*cm), t3, Spacer(1,0.1*cm), vd)
        elif not admisibles:
            r.story.append(Paragraph("No se encontraron datos de tensiones.", S['WarnText']))

        # == 5. SECCION MINIMA ==
        r.story.append(PageBreak())
        r._section_header("5","SECCION MINIMA DEL CONDUCTOR (IEEE 80 sec.11.3)")
        if seccion:
            I_f = seccion.get('I_falla', I_falla)
            ts_v = seccion.get('ts', 0); K_v = seccion.get('K', 197)
            S_c = seccion.get('S_calc', 0); S_f = seccion.get('S_final', 0)
            mat = seccion.get('material', 'Cobre recocido solido')
            r._sub_header("5.1 Parametros de Calculo")
            t1 = r._param_table([
                ["Parametro","Valor","Descripcion"],
                ["Corriente de falla (I_f)",f"{I_f:.2f} A","Corriente monofasica maxima"],
                ["Tiempo de despeje (ts)",f"{ts_v:.2f} s","Tiempo operacion del rele"],
                ["Material conductor",mat,"Material de la malla"],
                ["Factor K (material)",f"{K_v:.0f}","IEEE 80 Tabla 1"],
            ], [2.5*inch, 1.8*inch, 2.3*inch])
            r._sub_header("5.2 Resultado - Seccion Minima  [S = I_f * sqrt(ts) / K]")
            t2 = r._verdict_table([
                ["Calculo","Seccion (mm2)","Estado"],
                ["Seccion calculada (S_calc)",f"{S_c:.2f}","-"],
                ["Seccion minima normativa","25.00","-"],
                ["Seccion final adoptada (S_fin)",f"{S_f:.2f}","OK" if ok_seccion else "REVISAR"],
            ], [3.0*inch, 2.0*inch, 1.6*inch])
            vd = r._verdict_box(f"Seccion Final = {S_f:.2f} mm2  {'>=' if ok_seccion else '<'} 25 mm2  -  {'CUMPLE' if ok_seccion else 'NO CUMPLE'}", ok_seccion)
            r._keep(t1, Spacer(1,0.15*cm), t2, Spacer(1,0.1*cm), vd)
            r._h(0.2)
            r._sub_header("5.3 Factor K segun Material (IEEE 80 Tabla 1)")
            t3 = r._param_table([
                ["Material","K","T_max (C)","Aplicacion tipica"],
                ["Cobre recocido solido","197","450","Conductor principal de malla"],
                ["Cobre duro solido","187","450","Alta conductividad"],
                ["Cobre estanado (7 hilos)","172","250","Cable trenzado estanado"],
                ["Cobre recubierto acero","176","450","Copperweld"],
                ["Aluminio conductor solido","126","300","Ligero, menor K"],
                ["Acero galvanizado"," 80","400","Barras de tierra verticales"],
            ], [2.8*inch, 0.8*inch, 1.1*inch, 2.0*inch])
            r.story.append(t3)
        else:
            r.story.append(Paragraph("No se encontraron datos de seccion minima.", S['WarnText']))

        # == 6. CAPACITORES ==
        r.story.append(PageBreak())
        r._section_header("6","BANCO DE CAPACITORES - CORRECCION FACTOR DE POTENCIA")
        if capacitores:
            P=capacitores.get('P',0); fp_a=capacitores.get('fp_actual',0)
            fp_o=capacitores.get('fp_objetivo',0); kvar_c=capacitores.get('kvar_calculado',0)
            kvar_b=capacitores.get('kvar_banco',0)
            Q1 = P*math.tan(math.acos(fp_a)) if 0<fp_a<1 else 0
            Q2 = P*math.tan(math.acos(fp_o)) if 0<fp_o<1 else 0
            S1 = P/fp_a if fp_a>0 else 0; S2 = P/fp_o if fp_o>0 else 0
            r._sub_header("6.1 Situacion Antes y Despues de la Correccion")
            t1 = r._param_table([
                ["Magnitud","Antes (actual)","Despues (corregido)","Unidad"],
                ["Factor de Potencia",f"{fp_a:.2f}",f"{fp_o:.2f}","-"],
                ["Potencia Activa (P)",f"{P:.1f}",f"{P:.1f}","kW"],
                ["Potencia Reactiva (Q)",f"{Q1:.1f}",f"{Q2:.1f}","kVAR"],
                ["Potencia Aparente (S)",f"{S1:.1f}",f"{S2:.1f}","kVA"],
            ], [2.0*inch, 1.6*inch, 1.8*inch, 1.0*inch])
            r._sub_header("6.2 Seleccion del Banco y Protecciones")
            t2 = r._param_table([
                ["Parametro","Valor"],
                ["Potencia reactiva a compensar (Qc)",f"{kvar_c:.2f} kVAR"],
                ["Banco estandar seleccionado",f"{kvar_b:.1f} kVAR"],
                ["Tension de servicio BT",f"{capacitores.get('tension_bt',380)} V"],
                ["Interruptor automatico",capacitores.get('interruptor','N/A')],
                ["Cable de conexion",capacitores.get('cable','N/A')],
            ], [3.2*inch, 3.2*inch])
            r._keep(t1, Spacer(1,0.15*cm), t2)
        else:
            r.story.append(Paragraph("No se encontraron datos del banco de capacitores.", S['WarnText']))

        # == 7. VEREDICTO FINAL ==
        r.story.append(PageBreak())
        r._section_header("7","VEREDICTO FINAL Y RESUMEN DE VERIFICACIONES")
        todos_ok = all([ok_malla, ok_paso, ok_contacto, ok_seccion])
        R_v = f"{malla.get('R_referencia',0):.4f} Ohm" if malla else "-"
        Vp_v = f"{reales.get('Vp_real',0):.2f} V" if reales else "-"
        Vc_v = f"{reales.get('Vc_real',0):.2f} V" if reales else "-"
        S_v  = f"{seccion.get('S_final',0):.2f} mm2" if seccion else "-"
        tbl_res = r._verdict_table([
            ["N°","Verificacion","Limite Normativo","Valor Calculado","Estado"],
            ["1","Resistencia de Malla","<= 20.0 Ohm",R_v,"OK" if ok_malla else "NO CUMPLE"],
            ["2","Tension de Paso (50 kg)",f"<= {admisibles.get('Vp50',0):.1f} V" if admisibles else "-",Vp_v,"OK" if ok_paso else "NO CUMPLE"],
            ["3","Tension de Contacto (50 kg)",f"<= {admisibles.get('Vc50',0):.1f} V" if admisibles else "-",Vc_v,"OK" if ok_contacto else "NO CUMPLE"],
            ["4","Seccion Minima Conductor",">= 25 mm2",S_v,"OK" if ok_seccion else "REVISAR"],
        ], [0.3*inch, 2.1*inch, 1.5*inch, 1.5*inch, 1.2*inch])
        vdf = r._verdict_box(
            "DISENO APROBADO - Todos los parametros cumplen la normativa vigente" if todos_ok
            else "DISENO NO APROBADO - Se requieren modificaciones (ver detalles abajo)", todos_ok)
        r._keep(tbl_res, Spacer(1,0.2*cm), vdf)
        if not todos_ok:
            r._h(0.2)
            r._sub_header("Acciones Correctivas Recomendadas")
            if not ok_malla:
                r.story.append(Paragraph("* Resistencia de Malla: Aumentar el area, disminuir espaciamiento o agregar electrodos verticales.", S['Body']))
            if not ok_paso or not ok_contacto:
                r.story.append(Paragraph("* Tensiones de Paso/Contacto: Mejorar distribucion de conductores, aumentar espesor capa superficial o reducir resistividad.", S['Body']))
            if not ok_seccion:
                r.story.append(Paragraph("* Seccion del Conductor: Seleccionar conductor de mayor seccion comercial normativa.", S['Body']))
        r._h(0.3)
        r._sub_header("Observaciones Adicionales")
        obs = session_data.get('observaciones',
            "No se registraron observaciones adicionales. Mantener niveles de resistividad "
            "mediante mediciones periodicas y asegurar integridad de uniones soldadas durante construccion.")
        r.story.append(Paragraph(obs, S['Body']))
        r._h(0.4)
        r._hr()
        r._h(0.1)
        r.story.append(Paragraph(f"Informe generado por Energy Grid v3.0 - {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", S['Small']))
        r.story.append(Paragraph("RPTD N06 (Chile) - IEEE Std 80-2013 - IEC 60228",
            ParagraphStyle('FN', parent=S['Small'], alignment=TA_CENTER)))
        r.generate()
        return True
    except Exception as e:
        raise Exception(f"Error al generar informe: {str(e)}")