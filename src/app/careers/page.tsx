"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import {
  getReflectionPrompts,
  getTeacherAssessment,
  teacherAssessmentLanguages,
  type TeacherAssessmentLanguage,
  type TeacherAssessmentQuestion,
  QUESTIONS_PER_ASSESSMENT,
} from "@/lib/teacher-assessment";
import { translatorLanguages, type TranslatorExerciseLanguage } from "@/lib/translator-exercise";

export default function CareersPage() {
  const { t } = useLanguage();
  const copy = t.careersPage;
  const careersCopy = t.careers;
  const rolesCopy = copy.roleOptions;
  const formCopy = copy.form;
  const assessmentCopy = copy.assessments;
  const teacherLanguageLabels = useMemo(
    () =>
      teacherAssessmentLanguages.reduce<Record<TeacherAssessmentLanguage, string>>(
        (map, lang) => ({ ...map, [lang.id]: lang.label }),
        {} as Record<TeacherAssessmentLanguage, string>
      ),
    []
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["translator"]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const requiresTeacherAssessment = selectedRoles.includes("educator") || selectedRoles.includes("both");
  const requiresTranslatorExercise = selectedRoles.includes("translator") || selectedRoles.includes("both");
  const [selectedLanguages, setSelectedLanguages] = useState<TeacherAssessmentLanguage[]>([]);
  const [languageSeeds, setLanguageSeeds] = useState<Record<TeacherAssessmentLanguage, number>>({});
  const [answersByLanguage, setAnswersByLanguage] = useState<
    Record<TeacherAssessmentLanguage, Record<string, number>>
  >({});
  const [responsesByLanguage, setResponsesByLanguage] = useState<
    Record<TeacherAssessmentLanguage, { conflict: string; attendance: string }>
  >({});
  const [translatorLanguage, setTranslatorLanguage] = useState<TranslatorExerciseLanguage | "">("");
  const [translatorText, setTranslatorText] = useState("");

  const teacherQuestionSets = useMemo(() => {
    const map: Record<TeacherAssessmentLanguage, TeacherAssessmentQuestion[]> = {} as Record<
      TeacherAssessmentLanguage,
      TeacherAssessmentQuestion[]
    >;
    selectedLanguages.forEach((language) => {
      const seed = languageSeeds[language];
      if (typeof seed === "number") {
        map[language] = getTeacherAssessment(language, { seed, sampleSize: QUESTIONS_PER_ASSESSMENT });
      }
    });
    return map;
  }, [selectedLanguages, languageSeeds]);

  const teacherAssessmentsComplete = useMemo(() => {
    if (!requiresTeacherAssessment) return true;
    if (selectedLanguages.length === 0) return false;
    return selectedLanguages.every((language) => {
      const seed = languageSeeds[language];
      if (typeof seed !== "number") return false;
      const questions =
        teacherQuestionSets[language] ?? getTeacherAssessment(language, { seed, sampleSize: QUESTIONS_PER_ASSESSMENT });
      const answers = answersByLanguage[language] ?? {};
      const responses = responsesByLanguage[language] ?? { conflict: "", attendance: "" };
      return (
        questions.length === QUESTIONS_PER_ASSESSMENT &&
        Object.keys(answers).length === questions.length &&
        responses.conflict.trim().length > 0 &&
        responses.attendance.trim().length > 0
      );
    });
  }, [
    requiresTeacherAssessment,
    selectedLanguages,
    languageSeeds,
    teacherQuestionSets,
    answersByLanguage,
    responsesByLanguage,
  ]);

  const translatorExerciseComplete = requiresTranslatorExercise ? Boolean(translatorLanguage && translatorText.trim()) : true;
  const canUploadResume = teacherAssessmentsComplete && translatorExerciseComplete;

  useEffect(() => {
    if (!requiresTeacherAssessment) {
      setSelectedLanguages([]);
      setLanguageSeeds({});
      setAnswersByLanguage({});
      setResponsesByLanguage({});
    }
    if (!requiresTranslatorExercise) {
      setTranslatorLanguage("");
      setTranslatorText("");
    }
  }, [requiresTeacherAssessment, requiresTranslatorExercise]);

  const toggleRole = (value: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const toggleWorkingLanguage = (language: TeacherAssessmentLanguage) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(language)) {
        const next = prev.filter((item) => item !== language);
        setLanguageSeeds((seeds) => {
          const rest = { ...seeds };
          delete rest[language];
          return rest;
        });
        setAnswersByLanguage((prevAnswers) => {
          const rest = { ...prevAnswers };
          delete rest[language];
          return rest;
        });
        setResponsesByLanguage((prevResponses) => {
          const rest = { ...prevResponses };
          delete rest[language];
          return rest;
        });
        return next;
      }
      const seed = Math.floor(Math.random() * 1_000_000_000);
      setLanguageSeeds((prevSeeds) => ({ ...prevSeeds, [language]: seed }));
      return [...prev, language];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const extraLanguages = String(formData.get("languagesExtra") || "").trim();
    const selectedLabels = selectedLanguages.map((language) => teacherLanguageLabels[language]);
    const languageSummaryParts = [];
    if (selectedLabels.length) {
      languageSummaryParts.push(selectedLabels.join(", "));
    }
    if (extraLanguages) {
      languageSummaryParts.push(extraLanguages);
    }
    formData.set("languages", languageSummaryParts.join(" | "));
    formData.delete("languagesExtra");
    formData.set("workingLanguages", JSON.stringify(selectedLanguages));

    if (requiresTeacherAssessment) {
      if (!selectedLanguages.length) {
        setStatus("error");
        setMessage(assessmentCopy.validation.teacherLanguage);
        return;
      }
      const teacherAssessmentsPayload = [];
      for (const language of selectedLanguages) {
        const seed = languageSeeds[language];
        if (typeof seed !== "number") {
          setStatus("error");
          setMessage(assessmentCopy.validation.teacherLanguage);
          return;
        }
        const questions = teacherQuestionSets[language] ?? getTeacherAssessment(language, { seed, sampleSize: QUESTIONS_PER_ASSESSMENT });
        const answersMap = answersByLanguage[language] ?? {};
        const responses = responsesByLanguage[language] ?? { conflict: "", attendance: "" };
        if (
          questions.length === 0 ||
          Object.keys(answersMap).length !== questions.length ||
          !responses.conflict.trim() ||
          !responses.attendance.trim()
        ) {
          setStatus("error");
          setMessage(`${teacherLanguageLabels[language]} — ${assessmentCopy.validation.teacherIncomplete}`);
          return;
        }
        const serialized = questions.map((question) => ({
          questionId: question.id,
          selected: answersMap[question.id],
        }));
        teacherAssessmentsPayload.push({
          language,
          seed,
          answers: serialized,
          responses,
        });
      }
      formData.set("teacherAssessments", JSON.stringify(teacherAssessmentsPayload));
    } else {
      formData.delete("teacherAssessments");
    }

    if (requiresTranslatorExercise) {
      if (!translatorLanguage) {
        setStatus("error");
        setMessage(assessmentCopy.validation.translatorLanguage);
        return;
      }
      if (!translatorText.trim()) {
        setStatus("error");
        setMessage(assessmentCopy.validation.translatorText);
        return;
      }
      formData.set("translatorLanguage", translatorLanguage);
      formData.set("translatorText", translatorText.trim());
    } else {
      formData.delete("translatorLanguage");
      formData.delete("translatorText");
    }

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || formCopy.error);
      }
      form.reset();
      setSelectedRoles(["translator"]);
      setSelectedLanguages([]);
      setLanguageSeeds({});
      setAnswersByLanguage({});
      setResponsesByLanguage({});
      setTranslatorLanguage("");
      setTranslatorText("");
      setStatus("success");
      setMessage(formCopy.success);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : formCopy.error);
    }
  };

  const roleInputs = [
    { key: "translator", label: rolesCopy.translator },
    { key: "educator", label: rolesCopy.educator },
    { key: "both", label: rolesCopy.both },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-teal-50 text-slate-900">
      <section className="bg-gradient-to-r from-sky-900 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-teal-200 font-semibold">Talent network</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">{careersCopy.heading}</h1>
            <p className="mt-4 text-sm md:text-base text-sky-50/90 leading-relaxed">{careersCopy.text}</p>
            <ul className="mt-5 space-y-2 text-sm text-sky-50/90">
              {careersCopy.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-white/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="#apply"
                className="inline-flex items-center rounded-full bg-white text-sky-900 px-5 py-2 font-semibold hover:bg-sky-50 transition shadow-md shadow-sky-900/20"
              >
                Start application
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full border border-white/60 px-5 py-2 font-semibold text-white hover:bg-white/10"
              >
                {careersCopy.ctaSecondary}
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white text-slate-800 shadow-2xl shadow-sky-900/20 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-600 font-semibold">Benefits</p>
            <p className="mt-2 text-base font-semibold text-sky-900">Why talent joins JB Linguistics</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {careersCopy.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">{careersCopy.note}</p>
          </div>
        </div>
      </section>
      <section id="apply" className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <div className="rounded-3xl bg-white border border-teal-100 shadow-xl p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-500 font-semibold">Careers</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-sky-900">{copy.title}</h1>
          <p className="mt-4 text-sm md:text-base text-slate-700 leading-relaxed">{copy.intro}</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{copy.rolesTitle}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {roleInputs.map((role) => (
                <span key={role.key} className="rounded-full bg-white border border-slate-200 px-3 py-1">
                  {role.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-sky-900">{formCopy.heading}</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm" encType="multipart/form-data">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.name}</span>
                <input name="name" required className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.email}</span>
                <input type="email" name="email" required className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.location}</span>
                <input name="location" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-slate-600">{formCopy.languages}</span>
                <div className="rounded-2xl border border-slate-200 p-3 flex flex-wrap gap-3 bg-slate-50">
                  {teacherAssessmentLanguages.map((lang) => (
                    <label key={lang.id} className="flex items-center gap-2 text-xs md:text-sm">
                      <input
                        type="checkbox"
                        value={lang.id}
                        checked={selectedLanguages.includes(lang.id)}
                        onChange={() => toggleWorkingLanguage(lang.id)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
                <input
                  name="languagesExtra"
                  className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Other languages or notes"
                />
              </label>
            </div>
            <input
              type="hidden"
              name="languages"
              readOnly
              value={selectedLanguages.map((lang) => teacherLanguageLabels[lang]).join(", ")}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.experience}</span>
                <input name="experience" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-600">{formCopy.availability}</span>
                <input name="availability" className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. 15 hrs/week" />
              </label>
            </div>
            <fieldset className="rounded-2xl border border-slate-200 p-4">
              <legend className="px-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                {copy.rolesTitle}
              </legend>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {roleInputs.map((role) => (
                  <label key={role.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="roles"
                      value={role.key}
                      checked={selectedRoles.includes(role.key)}
                      onChange={() => toggleRole(role.key)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>{role.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-1">
              <span className="text-slate-600">{formCopy.message}</span>
              <textarea
                name="message"
                rows={4}
                className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-600">{formCopy.resume}</span>
              <input
                name="resume"
                type="file"
                required
                accept=".pdf,.doc,.docx,.rtf,.txt"
                disabled={!canUploadResume}
                className={`rounded-2xl border border-dashed px-4 py-3 text-sm ${
                  canUploadResume ? "border-teal-400 bg-teal-50" : "border-slate-300 bg-slate-100 text-slate-400"
                }`}
              />
              <span className="text-xs text-slate-500">{formCopy.resumeHint}</span>
              {!canUploadResume && (
                <span className="text-xs text-rose-600">
                  Complete the required assessments before uploading your resume.
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center rounded-full bg-teal-600 text-white px-6 py-2 text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : formCopy.submit}
            </button>
            {message && (
              <p className={`text-sm ${status === "error" ? "text-rose-600" : "text-teal-700"}`}>{message}</p>
            )}
            <input type="hidden" name="landing" value="careers-page" />
          </form>
          {requiresTeacherAssessment && (
            <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-500 font-semibold">
                  {assessmentCopy.teacher.heading}
                </p>
                <p className="mt-2 text-sm text-slate-600">{assessmentCopy.teacher.intro}</p>
                <p className="mt-1 text-xs text-slate-500">{assessmentCopy.teacher.requirementNote}</p>
              </div>
              {selectedLanguages.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {assessmentCopy.teacher.languagePlaceholder}
                </p>
              ) : (
                selectedLanguages.map((language) => {
                  const questions = teacherQuestionSets[language] ?? [];
                  const answersMap = answersByLanguage[language] ?? {};
                  const responses = responsesByLanguage[language] ?? { conflict: "", attendance: "" };
                  const reflection = getReflectionPrompts(language);
                  return (
                    <div key={language} className="rounded-3xl border border-white bg-white/70 p-4 space-y-4 shadow-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-sky-900">{teacherLanguageLabels[language]}</p>
                          <p className="text-xs text-slate-500">
                            {assessmentCopy.teacher.answeredLabel}: {Object.keys(answersMap).length}/{questions.length}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-rose-500 hover:text-rose-600"
                          onClick={() => toggleWorkingLanguage(language)}
                        >
                          Remove
                        </button>
                      </div>
                      <ol className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                        {questions.map((question, index) => (
                          <li key={question.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                            <p className="text-sm font-semibold text-sky-900">Q{index + 1}</p>
                            <p className="mt-1 text-sm text-slate-700">{question.prompt}</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => {
                            const name = `teacher-${language}-${question.id}`;
                            const checked = answersMap[question.id] === optionIndex;
                            return (
                              <label
                                key={`${question.id}-${optionIndex}`}
                                className={`flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm ${
                                  checked ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"
                                }`}
                              >
                                    <input
                                      type="radio"
                                      name={name}
                                      value={optionIndex}
                                      checked={checked}
                                      onChange={(event) =>
                                        setAnswersByLanguage((prev) => ({
                                          ...prev,
                                          [language]: {
                                            ...(prev[language] ?? {}),
                                            [question.id]: Number(event.target.value),
                                          },
                                        }))
                                      }
                                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span>{option}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-slate-600">
                          {reflection.conflict}
                          <textarea
                            value={responses.conflict}
                            onChange={(event) =>
                              setResponsesByLanguage((prev) => ({
                                ...prev,
                                [language]: { ...(prev[language] ?? { conflict: "", attendance: "" }), conflict: event.target.value },
                              }))
                            }
                            rows={4}
                            className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-slate-600">
                          {reflection.attendance}
                          <textarea
                            value={responses.attendance}
                            onChange={(event) =>
                              setResponsesByLanguage((prev) => ({
                                ...prev,
                                [language]: { ...(prev[language] ?? { conflict: "", attendance: "" }), attendance: event.target.value },
                              }))
                            }
                            rows={4}
                            className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          )}
          {requiresTranslatorExercise && (
            <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 space-y-4 shadow-lg">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-500 font-semibold">
                  {assessmentCopy.translator.heading}
                </p>
                <p className="mt-2 text-sm text-slate-700">{assessmentCopy.translator.intro}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {assessmentCopy.translator.storyHeading}
                </p>
                {assessmentCopy.translator.story.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">{assessmentCopy.translator.languageLabel}</span>
                <select
                  value={translatorLanguage}
                  onChange={(event) => setTranslatorLanguage(event.target.value as TranslatorExerciseLanguage)}
                  className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{assessmentCopy.translator.languagePlaceholder}</option>
                  {translatorLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-slate-600">{assessmentCopy.translator.submissionLabel}</span>
                <textarea
                  value={translatorText}
                  onChange={(event) => setTranslatorText(event.target.value)}
                  rows={6}
                  className="rounded-2xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-500">{assessmentCopy.translator.notes}</span>
              </label>
            </section>
          )}
          <p className="mt-6 text-xs text-slate-500">{copy.supportNote}</p>
          <p className="mt-2 text-xs">
            <Link href="/">← {copy.backLink}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
