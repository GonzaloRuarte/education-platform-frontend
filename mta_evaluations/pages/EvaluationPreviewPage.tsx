'use client'

import { withAuth } from '@/mta_auth/hocs/withAuth'
import { EVALUATION_NAME } from '@/mta_evaluations/constants'
import { useEvaluationPreview, useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import ResolutionQuestions from '@/mta_resolutions/components/ResolutionQuestions'
import Page from '@/shared/components/Page'
import Spacer from '@/shared/components/Spacer'
import Spinner from '@/shared/components/Spinner'
import { Pagination } from '@mui/material'
import { useParams } from 'next/navigation'
import { Box, useTheme, Typography} from '@mui/material'

import React, { useLayoutEffect, useRef, useState } from 'react';

interface StickyPinnedProps {
  text: string | null;
}

export const StickyPinned: React.FC<StickyPinnedProps> = ({ text }) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  // start with the theme’s body1 size
  const [fontSize, setFontSize] = useState<number | string>(theme.typography.body1.fontSize ?? 16);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const fits = () => el.scrollHeight <= el.clientHeight;

    // Try down-scaling until it fits or we reach 0.75 rem
    if (!fits()) {
      let size = parseFloat(fontSize as string);
      while (!fits() && size > 12) { // 12px ≈ 0.75rem
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
      setFontSize(`${size}px`);
    }
  }, [text]); // re-run when page changes

  if (!text) return null;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        maxHeight: '50vh',
        overflow: 'visible',
        p: 2,
      }}
    >
      <Typography
        ref={ref}
        component="div"
        sx={{ fontSize, lineHeight: 1.35 }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </Box>
  );
};







const EvaluationPreviewPage = () => {
  const { evaluationId } = useParams()
  const { data, reload } = useEvaluationPreview({ evaluationId: Number(evaluationId) })
  const [page, setPage] = React.useState(1)
  const navToDetail = useNavigateToEvaluationContentEdit()
  return (
    <Page>
      <Page.Title>Vista previa de {EVALUATION_NAME.singular}</Page.Title>
      <Page.BasicToolbar
        reload={reload}
        entityName={EVALUATION_NAME}
        id={Number(evaluationId)}
        onExit={() => navToDetail({ evaluationId: Number(evaluationId) })}
      />
      <Spacer />
      <Page.Content>
        {data === undefined ? (
          <Spinner />
        ) : (
          <>
            {data.pages_quantity > 1 && (
              <>
                <Pagination
                  count={data.pages_quantity}
                  page={page}
                  onChange={(_, value) => {
                    setPage(value)
                  }}
                />
                <Spacer />
              
            
                  {/* ── STICKY BANNER ─────────────────────────── */}
              <StickyPinned text={data.pages[page - 1].pinned_text} />

              {/* ── SCROLLABLE QUESTIONS AREA ─────────────── */}
              <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
                <ResolutionQuestions evaluationToResolve={data} currentPage={page} />
              </Box>
            </>
            )}
          </>
        )}
      </Page.Content>
    </Page>
  )
}

export default withAuth(EvaluationPreviewPage, {
  allowedUserProfiles: ['admin', 'evaluator'],
  logoutDestination: 'dashboard',
})
