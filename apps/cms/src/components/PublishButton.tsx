"use client";

import { formatAdminURL, hasAutosaveEnabled, hasScheduledPublishEnabled } from "payload/shared";
import {
  FormSubmit,
  PopupList,
  useConfig,
  useDocumentInfo,
  useForm,
  useFormModified,
  useLocale,
  useModal,
  useTranslation,
} from "@payloadcms/ui";
import { ScheduleDrawer } from "@payloadcms/ui/elements/PublishButton/ScheduleDrawer";

export default function PublishButton() {
  const {
    collectionSlug,
    globalSlug,
    hasPublishedDoc,
    hasPublishPermission,
    id,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
    unpublishedVersionCount,
    uploadStatus,
  } = useDocumentInfo();
  const {
    config: {
      routes: { api },
    },
    getEntityConfig,
  } = useConfig();
  const { submit } = useForm();
  const modified = useFormModified();
  const { code: locale } = useLocale();
  const { t } = useTranslation();
  const { isModalOpen, toggleModal } = useModal();
  const drawerSlug = `schedule-publish-${id}`;
  const entityConfig = collectionSlug
    ? getEntityConfig({ collectionSlug })
    : globalSlug
      ? getEntityConfig({ globalSlug })
      : undefined;
  const canSchedulePublish = Boolean(
    entityConfig &&
      hasScheduledPublishEnabled(entityConfig) &&
      hasPublishPermission &&
      (globalSlug || (collectionSlug && id)) &&
      (hasAutosaveEnabled(entityConfig) || !modified),
  );
  const schedulePublishConfig =
    entityConfig &&
    typeof entityConfig.versions?.drafts === "object" &&
    typeof entityConfig.versions.drafts.schedulePublish === "object"
      ? entityConfig.versions.drafts.schedulePublish
      : undefined;

  // A saved draft is publishable even after the form's modified flag resets.
  const canPublish = Boolean(
    hasPublishPermission &&
      uploadStatus !== "uploading" &&
      (modified || unpublishedVersionCount > 0 || !hasPublishedDoc),
  );

  const publish = async () => {
    if (!canPublish) return;

    const path = globalSlug
      ? `/globals/${globalSlug}`
      : `/${collectionSlug}${id ? `/${id}` : ""}`;
    const action = formatAdminURL({
      apiRoute: api,
      path: `${path}?depth=0&locale=${encodeURIComponent(locale)}` as `/${string}`,
    });
    const result = await submit({
      action,
      overrides: { _status: "published" },
    });

    if (result) {
      setUnpublishedVersionCount(0);
      setMostRecentVersionIsAutosaved(false);
      setHasPublishedDoc(true);
    }
  };

  return (
    <>
      <FormSubmit
        buttonId="action-save"
        disabled={!canPublish}
        enableSubMenu={canSchedulePublish}
        onClick={() => void publish()}
        size="medium"
        SubMenuPopupContent={canSchedulePublish ? ({ close }) => (
          <PopupList.ButtonGroup>
            <PopupList.Button
              id="schedule-publish"
              onClick={() => {
                toggleModal(drawerSlug);
                close();
              }}
            >
              {t("version:schedulePublish")}
            </PopupList.Button>
          </PopupList.ButtonGroup>
        ) : undefined}
        type="button"
      >
        {t("version:publishChanges")}
      </FormSubmit>
      {canSchedulePublish && isModalOpen(drawerSlug) ? (
        <ScheduleDrawer
          defaultType={unpublishedVersionCount > 0 ? "publish" : "unpublish"}
          schedulePublishConfig={schedulePublishConfig}
          slug={drawerSlug}
        />
      ) : null}
    </>
  );
}
